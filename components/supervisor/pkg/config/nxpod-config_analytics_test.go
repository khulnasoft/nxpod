// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package config

import (
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"

	"github.com/khulnasoft/nxpod/common-go/log"
	nxpod "github.com/khulnasoft/nxpod/nxpod-protocol"
)

func TestAnalyzeNxpodConfig(t *testing.T) {
	tests := []struct {
		Desc    string
		Prev    *nxpod.NxpodConfig
		Current *nxpod.NxpodConfig
		Fields  []string
	}{
		{
			Desc: "change",
			Prev: &nxpod.NxpodConfig{
				CheckoutLocation: "foo",
			},
			Current: &nxpod.NxpodConfig{
				CheckoutLocation: "bar",
			},
			Fields: []string{"CheckoutLocation"},
		},
		{
			Desc: "add",
			Prev: &nxpod.NxpodConfig{},
			Current: &nxpod.NxpodConfig{
				CheckoutLocation: "bar",
			},
			Fields: []string{"CheckoutLocation"},
		},
		{
			Desc: "remove",
			Prev: &nxpod.NxpodConfig{
				CheckoutLocation: "bar",
			},
			Current: &nxpod.NxpodConfig{},
			Fields:  []string{"CheckoutLocation"},
		},
		{
			Desc: "none",
			Prev: &nxpod.NxpodConfig{
				CheckoutLocation: "bar",
			},
			Current: &nxpod.NxpodConfig{
				CheckoutLocation: "bar",
			},
			Fields: nil,
		},
		{
			Desc:    "fie created",
			Current: &nxpod.NxpodConfig{},
			Fields:  nil,
		},
	}
	for _, test := range tests {
		t.Run(test.Desc, func(t *testing.T) {
			var fields []string
			analyzer := NewConfigAnalyzer(log.Log, 100*time.Millisecond, func(field string) {
				fields = append(fields, field)
			}, test.Prev)
			<-analyzer.Analyse(test.Current)
			if diff := cmp.Diff(test.Fields, fields); diff != "" {
				t.Errorf("unexpected output (-want +got):\n%s", diff)
			}
		})
	}
}
