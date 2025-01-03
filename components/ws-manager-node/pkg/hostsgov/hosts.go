// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

//go:build linux
// +build linux

package hostsgov

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"syscall"

	"github.com/khulnasoft/nxpod/common-go/log"
	"golang.org/x/xerrors"
)

// Host maps an IP address to a hostname
type Host struct {
	Addr string
	Name string
}

// HostSource provides a hostname and its corresponding IP address
type HostSource interface {
	Name() string

	// Start starts the source
	Start() error

	// Source provides hosts on the channel
	Source() <-chan []Host

	// Stop stops this source from providing hosts
	Stop()
}

const (
	// wsmanNodeMarkerComment is added to the end of a line to mark it as
	// added by ws-manager-node.
	fmtMarkerComment = " # added by ws-manager-node %s: %s"
)

// Governer controls a hosts resolvable domains
type Governer interface {
	Start()
}

// NewDirectGoverner creates a new hosts file governer
func NewDirectGoverner(name, hostsFile string, stopchan <-chan struct{}, sources ...HostSource) (*DirectGoverner, error) {
	lockFD, err := syscall.Open(hostsFile, syscall.O_RDWR, 0644)
	if err != nil {
		return nil, xerrors.Errorf("cannot open hosts file: %w", err)
	}
	fd := os.NewFile(uintptr(lockFD), hostsFile)

	return &DirectGoverner{
		Name:    name,
		Sources: sources,
		hostsFD: fd,
		lockFD:  lockFD,
		stop:    stopchan,
	}, nil
}

// DirectGoverner regularly updates the host's /etc/hosts file to add hostnames
// which can be resolved by the kubelet. We use this to resolve the registry.
type DirectGoverner struct {
	Name    string
	Sources []HostSource

	hostsFD *os.File
	lockFD  int
	stop    <-chan struct{}
}

type hostUpdate struct {
	Src   string
	Hosts []Host
}

// Start runs the hosts governer - this function does not return until the governer
// is stopped. It's intended to be called as a Go routine.
func (g *DirectGoverner) Start() {
	updates := make(chan hostUpdate)
	go g.updateHostsFile(updates)

	for _, src := range g.Sources {
		go func(src HostSource) {
			defer src.Stop()
			defer log.WithField("name", src.Name()).Info("hosts source shutting down")

			for {
				select {
				case inc := <-src.Source():
					if inc == nil {
						return
					}

					updates <- hostUpdate{src.Name(), inc}
				case <-g.stop:
					return
				}
			}
		}(src)

		err := src.Start()
		if err != nil {
			log.WithField("name", src.Name()).WithError(err).Error("cannot start host source")
		} else {
			log.WithField("name", src.Name()).Info("start hosts source")
		}
	}
}

func (g *DirectGoverner) updateHostsFile(inc <-chan hostUpdate) {
	for {
		var update hostUpdate
		select {
		case <-g.stop:
			defer log.Info("hosts updater shutting down")
			return
		case update = <-inc:
		}

		err := func() (err error) {
			ok, err := g.lockHostsFile()
			if err != nil {
				return
			}
			if !ok {
				return xerrors.Errorf("cannot acquire lock")
			}
			defer g.unlockHostsFile()

			_, err = g.hostsFD.Seek(0, 0)
			if err != nil {
				return xerrors.Errorf("cannot jump to start of hosts file: %w", err)
			}
			fc, err := ioutil.ReadAll(g.hostsFD)
			if err != nil {
				return xerrors.Errorf("cannot read hosts file: %w", err)
			}

			wsmanNodeMarkerComment := fmt.Sprintf(fmtMarkerComment, g.Name, update.Src)

			var newhosts []string
			// add all former hosts entries that did not come from us
			lines := strings.Split(string(fc), "\n")
			for _, l := range lines {
				if strings.Contains(l, wsmanNodeMarkerComment) {
					continue
				}
				if l == "" {
					continue
				}

				newhosts = append(newhosts, strings.TrimSpace(l))
			}
			// add all updated hosts
			for _, h := range update.Hosts {
				l := fmt.Sprintf("%s\t%s\t%s", h.Addr, h.Name, wsmanNodeMarkerComment)
				newhosts = append(newhosts, l)
			}

			newhostsfc := strings.Join(append(newhosts, ""), "\n")

			// write back
			_, err = g.hostsFD.Seek(0, 0)
			if err != nil {
				return xerrors.Errorf("cannot jump to start of hosts file: %w", err)
			}
			err = g.hostsFD.Truncate(0)
			if err != nil {
				log.WithError(err).Warn("cannot truncate hosts file - this might result in broken host resolution on the node")
			}
			_, err = g.hostsFD.WriteString(newhostsfc)
			if err != nil {
				return xerrors.Errorf("cannot write hosts file after truncating it - this will break hosts resolution on the node: %w", err)
			}
			log.WithField("hosts", newhostsfc).Debug("updated hosts file")
			return
		}()

		if err != nil {
			log.WithError(err).WithField("source", update.Src).Error("hosts update failed")
		}
	}
}

func (g *DirectGoverner) lockHostsFile() (lockAcquired bool, err error) {
	err = syscall.Flock(g.lockFD, syscall.LOCK_EX|syscall.LOCK_NB)
	if err == syscall.EWOULDBLOCK {
		return false, nil
	}
	if err != nil {
		return false, xerrors.Errorf("cannot acqiure lock: %w", err)
	}

	lockAcquired = true
	return
}

func (g *DirectGoverner) unlockHostsFile() (err error) {
	return syscall.Flock(g.lockFD, syscall.LOCK_UN)
}
