// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package server

import (
	"reflect"
	"testing"

	"github.com/khulnasoft/nxpod/ide-metrics-api/config"
)

func Test_allowListCollector_Reconcile(t *testing.T) {
	type args struct {
		labels map[string]string
	}
	c := &allowListCollector{
		Collector: nil,
		Labels:    []string{"hello", "world"},
		AllowLabelValues: map[string][]string{
			"hello":    {"awesome", "nxpod"},
			"world":    {"io"},
			"wildcard": {"*"},
		},
		AllowLabelDefaultValues: map[string]string{
			"hello": "defaultValue",
		},
		reportedUnexpected: make(map[string]struct{}),
	}
	tests := []struct {
		name string
		args args
		want map[string]string
	}{
		{
			name: "HappyPath",
			args: args{
				labels: map[string]string{
					"hello": "nxpod",
					"world": "io",
				},
			},
			want: map[string]string{
				"hello": "nxpod",
				"world": "io",
			},
		},
		{
			name: "MissedKeyFallbackToDefault",
			args: args{
				labels: map[string]string{
					"world": "io",
				},
			},
			want: map[string]string{
				"hello": "defaultValue",
				"world": "io",
			},
		},
		{
			name: "MissedDefaultFallbackToDefaultDefault",
			args: args{
				labels: map[string]string{},
			},
			want: map[string]string{
				"hello": "defaultValue",
				"world": UnknownValue,
			},
		},
		{
			name: "UnknownFiledDeleted",
			args: args{
				labels: map[string]string{
					"foo": "bar",
				},
			},
			want: map[string]string{
				"hello": "defaultValue",
				"world": UnknownValue,
			},
		},
		{
			name: "OutOfRangeValueUseDeafult",
			args: args{
				labels: map[string]string{
					"hello": "wrongValue",
				},
			},
			want: map[string]string{
				"hello": "defaultValue",
				"world": UnknownValue,
			},
		},
		{
			name: "OutOfRangeValueUseDeafult2",
			args: args{
				labels: map[string]string{
					"hello": "wrongValue",
					"world": "aa",
				},
			},
			want: map[string]string{
				"hello": "defaultValue",
				"world": UnknownValue,
			},
		},
		{
			name: "FreeStyle",
			args: args{
				labels: map[string]string{
					"hello": "nxpod",
					"world": "aa",
					"foo":   "bar",
				},
			},
			want: map[string]string{
				"hello": "nxpod",
				"world": UnknownValue,
			},
		},
		{
			name: "Wildcard",
			args: args{
				labels: map[string]string{
					"wildcard": "nxpod",
				},
			},
			want: map[string]string{
				"hello":    "defaultValue",
				"world":    UnknownValue,
				"wildcard": "nxpod",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := c.Reconcile("foo", tt.args.labels); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("allowListCollector.Reconcile() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_newAllowListCollector(t *testing.T) {
	type args struct {
		allowList   []config.LabelAllowList
		allowClient *config.ClientAllowList
	}
	type want struct {
		AllowLabelValues        map[string][]string
		AllowLabelDefaultValues map[string]string
		ClientLabel             string
	}
	tests := []struct {
		name string
		args args
		want *want
	}{
		{
			name: "HappyPath",
			args: args{
				allowList: []config.LabelAllowList{
					{
						Name:        "hello",
						AllowValues: []string{"world"},
					},
				},
				allowClient: &config.LabelAllowList{
					Name:         "nxpod",
					AllowValues:  []string{"awesome", "nxpod"},
					DefaultValue: "nxpod",
				},
			},
			want: &want{
				AllowLabelValues:        map[string][]string{"hello": {"world"}, "nxpod": {"awesome", "nxpod"}},
				AllowLabelDefaultValues: map[string]string{"nxpod": "nxpod"},
				ClientLabel:             "nxpod",
			},
		},
		{
			name: "ClientLabelIsNotDefined",
			args: args{
				allowList: []config.LabelAllowList{
					{
						Name:        "hello",
						AllowValues: []string{"world"},
					},
				},
				allowClient: nil,
			},
			want: &want{
				AllowLabelValues:        map[string][]string{"hello": {"world"}},
				AllowLabelDefaultValues: map[string]string{},
				ClientLabel:             "",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			instance := newAllowListCollector(tt.args.allowList, tt.args.allowClient)
			got := &want{
				AllowLabelValues:        instance.AllowLabelValues,
				AllowLabelDefaultValues: instance.AllowLabelDefaultValues,
				ClientLabel:             instance.ClientLabel,
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("newAllowListCollector() = %+v, want %+v", got, tt.want)
			}
		})
	}
}
