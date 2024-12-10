// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package client

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/bufbuild/connect-go"
	nxpod_experimental_v1connect "github.com/khulnasoft/nxpod/components/public-api/go/experimental/v1/v1connect"
)

type Nxpod struct {
	cfg *options

	Workspaces           nxpod_experimental_v1connect.WorkspacesServiceClient
	Editors              nxpod_experimental_v1connect.EditorServiceClient
	Teams                nxpod_experimental_v1connect.TeamsServiceClient
	Projects             nxpod_experimental_v1connect.ProjectsServiceClient
	PersonalAccessTokens nxpod_experimental_v1connect.TokensServiceClient
	IdentityProvider     nxpod_experimental_v1connect.IdentityProviderServiceClient
	User                 nxpod_experimental_v1connect.UserServiceClient
}

func New(options ...Option) (*Nxpod, error) {
	opts, err := evaluateOptions(defaultOptions(), options...)
	if err != nil {
		return nil, fmt.Errorf("failed to evaluate client options: %w", err)
	}

	if opts.credentials == "" {
		return nil, errors.New("no authentication credentials specified")
	}

	client := opts.client
	url := opts.url

	serviceOpts := []connect.ClientOption{
		connect.WithInterceptors(
			AuthorizationInterceptor(opts.credentials),
		),
	}

	return &Nxpod{
		cfg:                  opts,
		Teams:                nxpod_experimental_v1connect.NewTeamsServiceClient(client, url, serviceOpts...),
		Projects:             nxpod_experimental_v1connect.NewProjectsServiceClient(client, url, serviceOpts...),
		PersonalAccessTokens: nxpod_experimental_v1connect.NewTokensServiceClient(client, url, serviceOpts...),
		Workspaces:           nxpod_experimental_v1connect.NewWorkspacesServiceClient(client, url, serviceOpts...),
		Editors:              nxpod_experimental_v1connect.NewEditorServiceClient(client, url, serviceOpts...),
		IdentityProvider:     nxpod_experimental_v1connect.NewIdentityProviderServiceClient(client, url, serviceOpts...),
		User:                 nxpod_experimental_v1connect.NewUserServiceClient(client, url, serviceOpts...),
	}, nil
}

type Option func(opts *options) error

func WithURL(url string) Option {
	return func(opts *options) error {
		opts.url = url
		return nil
	}
}

func WithCredentials(token string) Option {
	return func(opts *options) error {
		opts.credentials = token
		return nil
	}
}

func WithHTTPClient(client *http.Client) Option {
	return func(opts *options) error {
		opts.client = client
		return nil
	}
}

type options struct {
	url         string
	client      *http.Client
	credentials string
}

func defaultOptions() *options {
	return &options{
		url:    "https://api.nxpod.io",
		client: http.DefaultClient,
	}
}

func evaluateOptions(base *options, opts ...Option) (*options, error) {
	for _, opt := range opts {
		if err := opt(base); err != nil {
			return nil, fmt.Errorf("failed to evaluate options: %w", err)
		}
	}

	return base, nil
}
