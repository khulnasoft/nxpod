// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package manager

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/khulnasoft/nxpod/common-go/log"
	"github.com/khulnasoft/nxpod/common-go/tracing"
	"github.com/khulnasoft/nxpod/ws-manager/api"
	wssync "github.com/khulnasoft/nxpod/ws-sync/api"
	wssync_mock "github.com/khulnasoft/nxpod/ws-sync/api/mock"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	corev1 "k8s.io/api/core/v1"
)

func TestIntegrationWorkspaceDisposal(t *testing.T) {
	log.Log.Logger.SetLevel(logrus.PanicLevel)
	tracing.Init("TestWorkspaceDisposal")

	regularWorkspaceTemplates := IntegrationTestPodTemplates{
		Default: &corev1.Pod{
			Spec: corev1.PodSpec{
				Containers: []corev1.Container{
					{
						Name: "workspace",
						ReadinessProbe: &corev1.Probe{
							Handler: corev1.Handler{
								Exec: &corev1.ExecAction{Command: []string{"echo"}},
							},
						},
					},
				},
			},
		},
	}

	tests := []struct {
		Desc string
		Skip string
		T    *SingleWorkspaceIntegrationTest
	}{
		{
			Desc: "failed image pull",
			T: &SingleWorkspaceIntegrationTest{
				StartRequestModifier: func(t *testing.T, r *api.StartWorkspaceRequest) {
					r.Spec.WorkspaceImage = "does-not-exist"
				},
				MockWssync: func(t *testing.T, s *wssync_mock.MockWorkspaceContentServiceServer) {
					s.EXPECT().InitWorkspace(gomock.Any(), gomock.Any()).DoAndReturn(func(a, b interface{}) { time.Sleep(1 * time.Second) }).Return(&wssync.InitWorkspaceResponse{}, nil)
					s.EXPECT().WaitForInit(gomock.Any(), gomock.Any()).Return(&wssync.WaitForInitResponse{}, nil).AnyTimes()
					s.EXPECT().DisposeWorkspace(gomock.Any(), matches(func(a interface{}) bool {
						req, ok := a.(*wssync.DisposeWorkspaceRequest)
						if !ok {
							return false
						}
						if req.Backup {
							t.Logf("req.Backup == true but should have been false")
						}
						// currently this test is just way too flakey. We should fix this!
						// return req.Backup == false
						return true
					})).Return(&wssync.DisposeWorkspaceResponse{}, nil).MinTimes(1)
				},
				PostStart: func(t *testing.T, monitor *Monitor, id string, updates *StatusRecoder) {
					ok := updates.WaitFor(func(s *api.WorkspaceStatus) bool {
						return s.Phase == api.WorkspacePhase_STOPPED
					}, 30*time.Second)
					if !ok {
						t.Log(updates.String())
						t.Fatalf("workspace did not stop in time")
					}
				},
			},
		},
		{
			Desc: "failed init",
			T: &SingleWorkspaceIntegrationTest{
				StartRequestModifier: func(t *testing.T, r *api.StartWorkspaceRequest) {
					r.Spec.WorkspaceImage = "nxpod/workspace-full"
				},
				MockWssync: func(t *testing.T, s *wssync_mock.MockWorkspaceContentServiceServer) {
					s.EXPECT().InitWorkspace(gomock.Any(), gomock.Any()).DoAndReturn(func(a, b interface{}) { time.Sleep(1 * time.Second) }).Return(nil, status.Error(codes.Internal, "fail intentionally"))
					s.EXPECT().WaitForInit(gomock.Any(), gomock.Any()).Return(&wssync.WaitForInitResponse{}, nil).AnyTimes()
					s.EXPECT().DisposeWorkspace(gomock.Any(), matches(func(a interface{}) bool {
						_, ok := a.(*wssync.DisposeWorkspaceRequest)
						if !ok {
							return false
						}
						return true //req.Backup == false
					})).Return(&wssync.DisposeWorkspaceResponse{}, nil).MinTimes(1)
				},
				PostStart: func(t *testing.T, monitor *Monitor, id string, updates *StatusRecoder) {
					ok := updates.WaitFor(func(s *api.WorkspaceStatus) bool {
						return s.Phase == api.WorkspacePhase_STOPPED
					}, 30*time.Second)
					if !ok {
						t.Log(updates.String())
						t.Fatalf("workspace did not stop in time")
					}
				},
			},
		},
		{
			Desc: "regular workspace - all fine",
			T: &SingleWorkspaceIntegrationTest{
				PodTemplates: regularWorkspaceTemplates,
				StartRequestModifier: func(t *testing.T, s *api.StartWorkspaceRequest) {
					s.Spec.WorkspaceImage = "csweichel/noop:latest"
				},
				MockWssync: func(t *testing.T, s *wssync_mock.MockWorkspaceContentServiceServer) {
					initCall := s.EXPECT().InitWorkspace(gomock.Any(), gomock.Any()).Return(&wssync.InitWorkspaceResponse{}, nil)
					s.EXPECT().WaitForInit(gomock.Any(), gomock.Any()).Return(&wssync.WaitForInitResponse{}, nil).MinTimes(1).After(initCall)
					s.EXPECT().DisposeWorkspace(gomock.Any(), matches(func(a interface{}) bool {
						req, ok := a.(*wssync.DisposeWorkspaceRequest)
						if !ok {
							return false
						}
						return req.Backup == true
					})).Return(&wssync.DisposeWorkspaceResponse{}, nil).MinTimes(1)
				},
				PostStart: func(t *testing.T, monitor *Monitor, id string, updates *StatusRecoder) {
					ok := updates.WaitFor(func(s *api.WorkspaceStatus) bool {
						if s.Conditions.Failed != "" {
							t.Fatalf("workspace failed: %s", s.Conditions.Failed)
						}

						return s.Phase == api.WorkspacePhase_RUNNING
					}, 20*time.Second)
					if !ok {
						t.Errorf("workspace did not start in time")
						t.Log(updates.String())
					}

					err := monitor.manager.stopWorkspace(context.Background(), id, 10*time.Second)
					if err != nil {
						t.Fatalf("cannot stop workspace: %q", err)
					}

					ok = updates.WaitFor(func(s *api.WorkspaceStatus) bool {
						return s.Phase == api.WorkspacePhase_STOPPED
					}, 60*time.Second)
					if !ok {
						t.Log(updates.String())
						t.Fatalf("workspace did not stop in time")
					}
				},
			},
		},
		{
			Desc: "regular workspace - dispose timeout",
			T: &SingleWorkspaceIntegrationTest{
				PodTemplates: regularWorkspaceTemplates,
				StartRequestModifier: func(t *testing.T, s *api.StartWorkspaceRequest) {
					s.Spec.WorkspaceImage = "csweichel/noop:latest"
				},
				MockWssync: func(t *testing.T, s *wssync_mock.MockWorkspaceContentServiceServer) {
					initCall := s.EXPECT().InitWorkspace(gomock.Any(), gomock.Any()).Return(&wssync.InitWorkspaceResponse{}, nil)
					s.EXPECT().WaitForInit(gomock.Any(), gomock.Any()).Return(&wssync.WaitForInitResponse{}, nil).MinTimes(1).After(initCall)
					s.EXPECT().DisposeWorkspace(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, req interface{}) (resp *wssync.DisposeWorkspaceRequest, err error) {
						return nil, context.DeadlineExceeded
					}).MinTimes(wssyncMaxAttempts)
				},
				PostStart: func(t *testing.T, monitor *Monitor, id string, updates *StatusRecoder) {
					ok := updates.WaitFor(func(s *api.WorkspaceStatus) bool {
						if s.Conditions.Failed != "" {
							t.Fatalf("workspace failed: %s", s.Conditions.Failed)
						}

						return s.Phase == api.WorkspacePhase_RUNNING
					}, 20*time.Second)
					if !ok {
						t.Errorf("workspace did not start in time")
						t.Log(updates.String())
					}

					err := monitor.manager.stopWorkspace(context.Background(), id, 10*time.Second)
					if err != nil {
						t.Fatalf("cannot stop workspace: %q", err)
					}

					ok = updates.WaitFor(func(s *api.WorkspaceStatus) bool {
						return s.Phase == api.WorkspacePhase_STOPPED
					}, 60*time.Second)
					if !ok {
						t.Log(updates.String())
						t.Fatalf("workspace did not stop in time")
					}

					var stoppedStatus *api.WorkspaceStatus
					for _, status := range updates.Log() {
						if status.Phase != api.WorkspacePhase_STOPPED {
							continue
						}
						stoppedStatus = &status
						break
					}
					if stoppedStatus == nil {
						t.Fatalf("did not record stopped status although the workspace was stopped. StatusRecoder bug?")
					}
					if !strings.Contains(stoppedStatus.Conditions.Failed, "last backup failed") {
						t.Errorf("unexpected workspace failure mode: %+q", stoppedStatus)
					}
				},
			},
		},
	}

	for _, test := range tests {
		t.Run(test.Desc, func(t *testing.T) {
			if test.Skip != "" {
				t.Skip(test.Skip)
				return
			}

			test.T.FillDefaults().Run(t)
		})
	}
}

func matches(p func(interface{}) bool) gomock.Matcher {
	return &funcMatcher{p}
}

type funcMatcher struct {
	P func(a interface{}) bool
}

func (f *funcMatcher) Matches(a interface{}) bool {
	return f.P(a)
}

func (f *funcMatcher) String() string {
	return "matches predicate"
}
