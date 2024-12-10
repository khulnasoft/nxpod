// Copyright (c) 2024 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

// Code generated by protoc-proxy-gen. DO NOT EDIT.

package v1connect

import (
	context "context"
	connect_go "github.com/bufbuild/connect-go"
	v1 "github.com/khulnasoft/nxpod/components/public-api/go/v1"
)

var _ ConfigurationServiceHandler = (*ProxyConfigurationServiceHandler)(nil)

type ProxyConfigurationServiceHandler struct {
	Client v1.ConfigurationServiceClient
	UnimplementedConfigurationServiceHandler
}

func (s *ProxyConfigurationServiceHandler) CreateConfiguration(ctx context.Context, req *connect_go.Request[v1.CreateConfigurationRequest]) (*connect_go.Response[v1.CreateConfigurationResponse], error) {
	resp, err := s.Client.CreateConfiguration(ctx, req.Msg)
	if err != nil {
		// TODO(milan): Convert to correct status code
		return nil, err
	}

	return connect_go.NewResponse(resp), nil
}

func (s *ProxyConfigurationServiceHandler) GetConfiguration(ctx context.Context, req *connect_go.Request[v1.GetConfigurationRequest]) (*connect_go.Response[v1.GetConfigurationResponse], error) {
	resp, err := s.Client.GetConfiguration(ctx, req.Msg)
	if err != nil {
		// TODO(milan): Convert to correct status code
		return nil, err
	}

	return connect_go.NewResponse(resp), nil
}

func (s *ProxyConfigurationServiceHandler) ListConfigurations(ctx context.Context, req *connect_go.Request[v1.ListConfigurationsRequest]) (*connect_go.Response[v1.ListConfigurationsResponse], error) {
	resp, err := s.Client.ListConfigurations(ctx, req.Msg)
	if err != nil {
		// TODO(milan): Convert to correct status code
		return nil, err
	}

	return connect_go.NewResponse(resp), nil
}

func (s *ProxyConfigurationServiceHandler) UpdateConfiguration(ctx context.Context, req *connect_go.Request[v1.UpdateConfigurationRequest]) (*connect_go.Response[v1.UpdateConfigurationResponse], error) {
	resp, err := s.Client.UpdateConfiguration(ctx, req.Msg)
	if err != nil {
		// TODO(milan): Convert to correct status code
		return nil, err
	}

	return connect_go.NewResponse(resp), nil
}

func (s *ProxyConfigurationServiceHandler) DeleteConfiguration(ctx context.Context, req *connect_go.Request[v1.DeleteConfigurationRequest]) (*connect_go.Response[v1.DeleteConfigurationResponse], error) {
	resp, err := s.Client.DeleteConfiguration(ctx, req.Msg)
	if err != nil {
		// TODO(milan): Convert to correct status code
		return nil, err
	}

	return connect_go.NewResponse(resp), nil
}
