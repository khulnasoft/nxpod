// Copyright (c) 2024 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

// Code generated by protoc-proxy-gen. DO NOT EDIT.

package v1connect

import (
	context "context"
	connect_go "github.com/bufbuild/connect-go"
	v1 "github.com/khulnasoft/nxpod/components/public-api/go/experimental/v1"
)

var _ ProjectsServiceHandler = (*ProxyProjectsServiceHandler)(nil)

type ProxyProjectsServiceHandler struct {
	Client v1.ProjectsServiceClient
	UnimplementedProjectsServiceHandler
}

func (s *ProxyProjectsServiceHandler) CreateProject(ctx context.Context, req *connect_go.Request[v1.CreateProjectRequest]) (*connect_go.Response[v1.CreateProjectResponse], error) {
	resp, err := s.Client.CreateProject(ctx, req.Msg)
	if err != nil {
		// TODO(milan): Convert to correct status code
		return nil, err
	}

	return connect_go.NewResponse(resp), nil
}

func (s *ProxyProjectsServiceHandler) GetProject(ctx context.Context, req *connect_go.Request[v1.GetProjectRequest]) (*connect_go.Response[v1.GetProjectResponse], error) {
	resp, err := s.Client.GetProject(ctx, req.Msg)
	if err != nil {
		// TODO(milan): Convert to correct status code
		return nil, err
	}

	return connect_go.NewResponse(resp), nil
}

func (s *ProxyProjectsServiceHandler) ListProjects(ctx context.Context, req *connect_go.Request[v1.ListProjectsRequest]) (*connect_go.Response[v1.ListProjectsResponse], error) {
	resp, err := s.Client.ListProjects(ctx, req.Msg)
	if err != nil {
		// TODO(milan): Convert to correct status code
		return nil, err
	}

	return connect_go.NewResponse(resp), nil
}

func (s *ProxyProjectsServiceHandler) DeleteProject(ctx context.Context, req *connect_go.Request[v1.DeleteProjectRequest]) (*connect_go.Response[v1.DeleteProjectResponse], error) {
	resp, err := s.Client.DeleteProject(ctx, req.Msg)
	if err != nil {
		// TODO(milan): Convert to correct status code
		return nil, err
	}

	return connect_go.NewResponse(resp), nil
}
