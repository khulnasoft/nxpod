// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package diskguard

import (
	"fmt"
	"syscall"
	"time"

	"github.com/khulnasoft/nxpod/common-go/log"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/util/retry"
)

const (
	// LabelDiskPressure is set on a node if any of the guarded disks have
	// too little space available.
	LabelDiskPressure = "nxpod.io/diskPressure"
)

// Guard regularly checks how much free space is left on a path/disk.
// If the percentage of used space goes above a certain threshold,
// we'll label the node accordingly - and remove the label once that condition
// subsides.
type Guard struct {
	Path          string
	Nodename      string
	MinBytesAvail uint64
	Clientset     kubernetes.Interface
}

// Start starts the disk guard
func (g *Guard) Start(period time.Duration) {
	t := time.NewTicker(period)
	for {
		bvail, err := getAvailableBytes(g.Path)
		if err != nil {
			log.WithError(err).WithField("path", g.Path).Error("cannot check how much space is available")
			continue
		}
		log.WithField("bvail", bvail).WithField("minBytesAvail", g.MinBytesAvail).Debug("checked for available disk space")

		addLabel := bvail <= g.MinBytesAvail
		err = g.setLabel(LabelDiskPressure, addLabel)
		if err != nil {
			log.WithError(err).Error("cannot update node label")
		}

		<-t.C
	}
}

// setLabel adds or removes the label from the node
func (g *Guard) setLabel(label string, add bool) error {
	return retry.RetryOnConflict(retry.DefaultBackoff, func() error {
		node, err := g.Clientset.CoreV1().Nodes().Get(g.Nodename, metav1.GetOptions{})
		if err != nil {
			return err
		}
		_, hasLabel := node.Labels[label]
		if add == hasLabel {
			return nil
		}

		if add {
			node.Labels[label] = "true"
			log.WithField("node", g.Nodename).WithField("label", label).Info("adding label to node")
		} else {
			delete(node.Labels, label)
			log.WithField("node", g.Nodename).WithField("label", label).Info("removing label from node")
		}
		_, err = g.Clientset.CoreV1().Nodes().Update(node)
		if err != nil {
			return err
		}

		return nil
	})
}

func getAvailableBytes(path string) (bvail uint64, err error) {
	var stat syscall.Statfs_t
	err = syscall.Statfs(path, &stat)
	if err != nil {
		return 0, fmt.Errorf("cannot stat %s: %w", path, err)
	}

	bvail = stat.Bavail * uint64(stat.Bsize)
	return
}