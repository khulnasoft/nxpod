// Copyright (c) 2024 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             (unknown)
// source: nxpod/experimental/v1/stats.proto

package v1

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// StatsServiceClient is the client API for StatsService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type StatsServiceClient interface {
	// Retrieves the current user stats
	GetUserStats(ctx context.Context, in *GetUserStatsRequest, opts ...grpc.CallOption) (*GetUserStatsResponse, error)
}

type statsServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewStatsServiceClient(cc grpc.ClientConnInterface) StatsServiceClient {
	return &statsServiceClient{cc}
}

func (c *statsServiceClient) GetUserStats(ctx context.Context, in *GetUserStatsRequest, opts ...grpc.CallOption) (*GetUserStatsResponse, error) {
	out := new(GetUserStatsResponse)
	err := c.cc.Invoke(ctx, "/nxpod.experimental.v1.StatsService/GetUserStats", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// StatsServiceServer is the server API for StatsService service.
// All implementations must embed UnimplementedStatsServiceServer
// for forward compatibility
type StatsServiceServer interface {
	// Retrieves the current user stats
	GetUserStats(context.Context, *GetUserStatsRequest) (*GetUserStatsResponse, error)
	mustEmbedUnimplementedStatsServiceServer()
}

// UnimplementedStatsServiceServer must be embedded to have forward compatible implementations.
type UnimplementedStatsServiceServer struct {
}

func (UnimplementedStatsServiceServer) GetUserStats(context.Context, *GetUserStatsRequest) (*GetUserStatsResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetUserStats not implemented")
}
func (UnimplementedStatsServiceServer) mustEmbedUnimplementedStatsServiceServer() {}

// UnsafeStatsServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to StatsServiceServer will
// result in compilation errors.
type UnsafeStatsServiceServer interface {
	mustEmbedUnimplementedStatsServiceServer()
}

func RegisterStatsServiceServer(s grpc.ServiceRegistrar, srv StatsServiceServer) {
	s.RegisterService(&StatsService_ServiceDesc, srv)
}

func _StatsService_GetUserStats_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetUserStatsRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(StatsServiceServer).GetUserStats(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/nxpod.experimental.v1.StatsService/GetUserStats",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(StatsServiceServer).GetUserStats(ctx, req.(*GetUserStatsRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// StatsService_ServiceDesc is the grpc.ServiceDesc for StatsService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var StatsService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "nxpod.experimental.v1.StatsService",
	HandlerType: (*StatsServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "GetUserStats",
			Handler:    _StatsService_GetUserStats_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "nxpod/experimental/v1/stats.proto",
}