// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package builder

import (
	"archive/tar"
	"context"
	"crypto/sha256"
	"fmt"
	"io"
	"os"

	"github.com/docker/docker/api/types"
	docker "github.com/docker/docker/client"
	"github.com/docker/docker/pkg/jsonmessage"
	"github.com/khulnasoft/nxpod/common-go/log"
	"github.com/sirupsen/logrus"
	"golang.org/x/xerrors"
)

const (
	selfbuildDockerfile = `
FROM alpine:3.9

# Add nxpod user for operations (e.g. checkout because of the post-checkout hook!)
RUN addgroup -g 33333 nxpod \
    && adduser -D -h /home/nxpod -s /bin/sh -u 33333 -G nxpod nxpod \
    && echo "nxpod:nxpod" | chpasswd

RUN apk add --no-cache git bash openssh-client lz4 coreutils

COPY bob /bob
COPY nxpodLayer.tar.gz /nxpodLayer.tar.gz
RUN mkdir /nxpod-layer && cd /nxpod-layer && tar xzfv /nxpodLayer.tar.gz
`
)

// SelfBuild builds the image of itself which the image builder requires to work
func SelfBuild(ctx context.Context, rep, nxpodLayerLoc string, client *docker.Client) (ref string, err error) {
	rd, wr := io.Pipe()

	gplayerhash, err := computeNxpodLayerHash(nxpodLayerLoc)
	if err != nil {
		return "", err
	}

	hash, err := computeSelfbuildHash(gplayerhash)
	if err != nil {
		return "", err
	}

	errchan := make(chan error)
	go func() {
		errchan <- writeSelfBuildContext(wr, nxpodLayerLoc)
	}()

	ref = fmt.Sprintf("%s:%s", rep, hash)
	resp, err := client.ImageBuild(ctx, rd, types.ImageBuildOptions{
		Tags:           []string{ref},
		PullParent:     true,
		SuppressOutput: false,
		Labels: map[string]string{
			LabelProtected: "true",
		},
	})
	if err != nil {
		return "", err
	}

	pterrchan := make(chan error)
	go func() {
		err := jsonmessage.DisplayJSONMessagesStream(resp.Body, log.Log.Logger.WriterLevel(logrus.DebugLevel), 0, false, nil)

		resp.Body.Close()
		pterrchan <- err
	}()

	var done bool
	for !done {
		var err error
		select {
		case err = <-errchan:
		case err = <-pterrchan:
			done = true
		}

		if err != nil {
			return "", err
		}
	}

	return ref, nil
}

func computeNxpodLayerHash(nxpodLayerLoc string) (string, error) {
	inpt, err := os.OpenFile(nxpodLayerLoc, os.O_RDONLY, 0600)
	if err != nil {
		return "", xerrors.Errorf("cannot compute nxpod layer hash: %w", err)
	}
	defer inpt.Close()

	hash := sha256.New()
	_, err = io.Copy(hash, inpt)
	if err != nil {
		return "", xerrors.Errorf("cannot compute nxpod layer hash: %w", err)
	}
	return fmt.Sprintf("%x", hash.Sum([]byte{})), nil
}

func computeSelfbuildHash(nxpodLayerHash string) (string, error) {
	self, err := os.Executable()
	if err != nil {
		return "", xerrors.Errorf("cannot compute selbuild hash: %w", err)
	}
	selfin, err := os.OpenFile(self, os.O_RDONLY, 0600)
	if err != nil {
		return "", xerrors.Errorf("cannot compute selbuild hash: %w", err)
	}
	defer selfin.Close()

	hash := sha256.New()
	_, err = io.Copy(hash, selfin)
	if err != nil {
		return "", xerrors.Errorf("cannot compute selbuild hash: %w", err)
	}

	_, err = fmt.Fprintf(hash, "\nbaseref=%s\n", nxpodLayerHash)
	if err != nil {
		return "", xerrors.Errorf("cannot compute selbuild hash: %w", err)
	}

	return fmt.Sprintf("%x", hash.Sum([]byte{})), nil
}

func writeSelfBuildContext(o io.WriteCloser, nxpodLayerLoc string) (err error) {
	defer o.Close()

	self, err := os.Executable()
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}

	selfin, err := os.OpenFile(self, os.O_RDONLY, 0600)
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}
	defer selfin.Close()
	stat, err := selfin.Stat()
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}

	arc := tar.NewWriter(o)
	defer arc.Close()

	// add bob
	err = arc.WriteHeader(&tar.Header{
		Name:    "bob",
		Size:    stat.Size(),
		ModTime: stat.ModTime(),
		Mode:    0755,
	})
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}
	_, err = io.Copy(arc, selfin)
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}

	// add nxpodLayer
	gplayerIn, err := os.OpenFile(nxpodLayerLoc, os.O_RDONLY, 0600)
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}
	defer gplayerIn.Close()
	stat, err = gplayerIn.Stat()
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}
	err = arc.WriteHeader(&tar.Header{
		Name:    "nxpodLayer.tar.gz",
		Size:    stat.Size(),
		ModTime: stat.ModTime(),
		Mode:    0755,
	})
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}
	_, err = io.Copy(arc, gplayerIn)
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}

	err = arc.WriteHeader(&tar.Header{
		Name: "Dockerfile",
		Size: int64(len(selfbuildDockerfile)),
		Mode: 0755,
	})
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}
	_, err = arc.Write([]byte(selfbuildDockerfile))
	if err != nil {
		return xerrors.Errorf("cannot write selfbuild context: %w", err)
	}

	log.Debug("self-build context sent")

	return nil
}
