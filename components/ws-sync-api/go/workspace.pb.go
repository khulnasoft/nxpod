// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

// Code generated by protoc-gen-go. DO NOT EDIT.
// source: workspace.proto

package api

import (
	context "context"
	fmt "fmt"
	api "github.com/khulnasoft/nxpod/content-service/api"
	proto "github.com/golang/protobuf/proto"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
	math "math"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion3 // please upgrade the proto package

type BackupCanaryRequest struct {
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *BackupCanaryRequest) Reset()         { *m = BackupCanaryRequest{} }
func (m *BackupCanaryRequest) String() string { return proto.CompactTextString(m) }
func (*BackupCanaryRequest) ProtoMessage()    {}
func (*BackupCanaryRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_dac718ecaafc2333, []int{0}
}

func (m *BackupCanaryRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_BackupCanaryRequest.Unmarshal(m, b)
}
func (m *BackupCanaryRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_BackupCanaryRequest.Marshal(b, m, deterministic)
}
func (m *BackupCanaryRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_BackupCanaryRequest.Merge(m, src)
}
func (m *BackupCanaryRequest) XXX_Size() int {
	return xxx_messageInfo_BackupCanaryRequest.Size(m)
}
func (m *BackupCanaryRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_BackupCanaryRequest.DiscardUnknown(m)
}

var xxx_messageInfo_BackupCanaryRequest proto.InternalMessageInfo

type BackupCanaryResponse struct {
	Success              bool     `protobuf:"varint,2,opt,name=success,proto3" json:"success,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *BackupCanaryResponse) Reset()         { *m = BackupCanaryResponse{} }
func (m *BackupCanaryResponse) String() string { return proto.CompactTextString(m) }
func (*BackupCanaryResponse) ProtoMessage()    {}
func (*BackupCanaryResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_dac718ecaafc2333, []int{1}
}

func (m *BackupCanaryResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_BackupCanaryResponse.Unmarshal(m, b)
}
func (m *BackupCanaryResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_BackupCanaryResponse.Marshal(b, m, deterministic)
}
func (m *BackupCanaryResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_BackupCanaryResponse.Merge(m, src)
}
func (m *BackupCanaryResponse) XXX_Size() int {
	return xxx_messageInfo_BackupCanaryResponse.Size(m)
}
func (m *BackupCanaryResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_BackupCanaryResponse.DiscardUnknown(m)
}

var xxx_messageInfo_BackupCanaryResponse proto.InternalMessageInfo

func (m *BackupCanaryResponse) GetSuccess() bool {
	if m != nil {
		return m.Success
	}
	return false
}

type PauseTheiaRequest struct {
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *PauseTheiaRequest) Reset()         { *m = PauseTheiaRequest{} }
func (m *PauseTheiaRequest) String() string { return proto.CompactTextString(m) }
func (*PauseTheiaRequest) ProtoMessage()    {}
func (*PauseTheiaRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_dac718ecaafc2333, []int{2}
}

func (m *PauseTheiaRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_PauseTheiaRequest.Unmarshal(m, b)
}
func (m *PauseTheiaRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_PauseTheiaRequest.Marshal(b, m, deterministic)
}
func (m *PauseTheiaRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_PauseTheiaRequest.Merge(m, src)
}
func (m *PauseTheiaRequest) XXX_Size() int {
	return xxx_messageInfo_PauseTheiaRequest.Size(m)
}
func (m *PauseTheiaRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_PauseTheiaRequest.DiscardUnknown(m)
}

var xxx_messageInfo_PauseTheiaRequest proto.InternalMessageInfo

type PauseTheiaResponse struct {
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *PauseTheiaResponse) Reset()         { *m = PauseTheiaResponse{} }
func (m *PauseTheiaResponse) String() string { return proto.CompactTextString(m) }
func (*PauseTheiaResponse) ProtoMessage()    {}
func (*PauseTheiaResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_dac718ecaafc2333, []int{3}
}

func (m *PauseTheiaResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_PauseTheiaResponse.Unmarshal(m, b)
}
func (m *PauseTheiaResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_PauseTheiaResponse.Marshal(b, m, deterministic)
}
func (m *PauseTheiaResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_PauseTheiaResponse.Merge(m, src)
}
func (m *PauseTheiaResponse) XXX_Size() int {
	return xxx_messageInfo_PauseTheiaResponse.Size(m)
}
func (m *PauseTheiaResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_PauseTheiaResponse.DiscardUnknown(m)
}

var xxx_messageInfo_PauseTheiaResponse proto.InternalMessageInfo

type GitStatusRequest struct {
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *GitStatusRequest) Reset()         { *m = GitStatusRequest{} }
func (m *GitStatusRequest) String() string { return proto.CompactTextString(m) }
func (*GitStatusRequest) ProtoMessage()    {}
func (*GitStatusRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_dac718ecaafc2333, []int{4}
}

func (m *GitStatusRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_GitStatusRequest.Unmarshal(m, b)
}
func (m *GitStatusRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_GitStatusRequest.Marshal(b, m, deterministic)
}
func (m *GitStatusRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_GitStatusRequest.Merge(m, src)
}
func (m *GitStatusRequest) XXX_Size() int {
	return xxx_messageInfo_GitStatusRequest.Size(m)
}
func (m *GitStatusRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_GitStatusRequest.DiscardUnknown(m)
}

var xxx_messageInfo_GitStatusRequest proto.InternalMessageInfo

type GitStatusResponse struct {
	Repo                 *api.GitStatus `protobuf:"bytes,1,opt,name=repo,proto3" json:"repo,omitempty"`
	XXX_NoUnkeyedLiteral struct{}       `json:"-"`
	XXX_unrecognized     []byte         `json:"-"`
	XXX_sizecache        int32          `json:"-"`
}

func (m *GitStatusResponse) Reset()         { *m = GitStatusResponse{} }
func (m *GitStatusResponse) String() string { return proto.CompactTextString(m) }
func (*GitStatusResponse) ProtoMessage()    {}
func (*GitStatusResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_dac718ecaafc2333, []int{5}
}

func (m *GitStatusResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_GitStatusResponse.Unmarshal(m, b)
}
func (m *GitStatusResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_GitStatusResponse.Marshal(b, m, deterministic)
}
func (m *GitStatusResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_GitStatusResponse.Merge(m, src)
}
func (m *GitStatusResponse) XXX_Size() int {
	return xxx_messageInfo_GitStatusResponse.Size(m)
}
func (m *GitStatusResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_GitStatusResponse.DiscardUnknown(m)
}

var xxx_messageInfo_GitStatusResponse proto.InternalMessageInfo

func (m *GitStatusResponse) GetRepo() *api.GitStatus {
	if m != nil {
		return m.Repo
	}
	return nil
}

func init() {
	proto.RegisterType((*BackupCanaryRequest)(nil), "wsbs.BackupCanaryRequest")
	proto.RegisterType((*BackupCanaryResponse)(nil), "wsbs.BackupCanaryResponse")
	proto.RegisterType((*PauseTheiaRequest)(nil), "wsbs.PauseTheiaRequest")
	proto.RegisterType((*PauseTheiaResponse)(nil), "wsbs.PauseTheiaResponse")
	proto.RegisterType((*GitStatusRequest)(nil), "wsbs.GitStatusRequest")
	proto.RegisterType((*GitStatusResponse)(nil), "wsbs.GitStatusResponse")
}

func init() {
	proto.RegisterFile("workspace.proto", fileDescriptor_dac718ecaafc2333)
}

var fileDescriptor_dac718ecaafc2333 = []byte{
	// 317 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x6c, 0x91, 0x41, 0x4f, 0xea, 0x40,
	0x14, 0x85, 0x99, 0x17, 0xf2, 0xde, 0xf3, 0x6a, 0xa2, 0x0c, 0x28, 0xa5, 0x2b, 0xd2, 0xc4, 0x58,
	0x17, 0x6d, 0x09, 0xee, 0x5d, 0xc0, 0x42, 0x8d, 0x1b, 0x83, 0x26, 0x26, 0xee, 0x86, 0xf1, 0x06,
	0x26, 0xe0, 0xcc, 0x38, 0x77, 0x2a, 0xc1, 0xff, 0xeb, 0xff, 0x30, 0xd2, 0x56, 0x50, 0xd8, 0xb5,
	0xe7, 0x9e, 0x39, 0x73, 0xbf, 0x33, 0x70, 0xb8, 0x30, 0x6e, 0x46, 0x56, 0x48, 0x4c, 0xad, 0x33,
	0xde, 0xf0, 0xfa, 0x82, 0xc6, 0x14, 0x9e, 0x4a, 0xa3, 0x3d, 0x6a, 0x9f, 0x10, 0xba, 0x37, 0x25,
	0x31, 0x11, 0x56, 0x65, 0x4a, 0x2b, 0xaf, 0xc4, 0x5c, 0xbd, 0xa3, 0x2b, 0xcc, 0xd1, 0x31, 0x34,
	0x07, 0x42, 0xce, 0x72, 0x3b, 0x14, 0x5a, 0xb8, 0xe5, 0x08, 0x5f, 0x73, 0x24, 0x1f, 0xf5, 0xa0,
	0xf5, 0x53, 0x26, 0x6b, 0x34, 0x21, 0x0f, 0xe0, 0x1f, 0xe5, 0x52, 0x22, 0x51, 0xf0, 0xa7, 0xcb,
	0xe2, 0xff, 0xa3, 0xea, 0x37, 0x6a, 0x42, 0xe3, 0x4e, 0xe4, 0x84, 0x0f, 0x53, 0x54, 0xa2, 0x8a,
	0x69, 0x01, 0xdf, 0x14, 0x8b, 0x90, 0x88, 0xc3, 0xd1, 0x95, 0xf2, 0xf7, 0x5e, 0xf8, 0x9c, 0x2a,
	0xe7, 0x00, 0x1a, 0x1b, 0x5a, 0x79, 0x5b, 0x02, 0x75, 0x87, 0xd6, 0x04, 0xac, 0xcb, 0xe2, 0xfd,
	0x7e, 0x27, 0x2d, 0x91, 0x4a, 0xa2, 0x74, 0x7d, 0x60, 0x65, 0xeb, 0x7f, 0x30, 0x68, 0xdc, 0xe8,
	0xc7, 0xaa, 0x8e, 0x6b, 0x9c, 0x5b, 0x74, 0xfc, 0x16, 0x0e, 0x36, 0x51, 0x78, 0x98, 0x7e, 0xf5,
	0x93, 0xee, 0xc2, 0x0b, 0x3b, 0xbb, 0x66, 0xc5, 0x82, 0xb5, 0x98, 0xf5, 0x18, 0x1f, 0x02, 0xac,
	0x81, 0x78, 0xbb, 0xb0, 0x6f, 0x71, 0x87, 0xc1, 0xf6, 0xa0, 0x64, 0xaf, 0xc5, 0x8c, 0x5f, 0xc2,
	0xde, 0xf7, 0xea, 0xfc, 0xa4, 0xb0, 0xfe, 0x2e, 0x24, 0x6c, 0x6f, 0xe9, 0x55, 0xc2, 0xe0, 0xfc,
	0xe9, 0x6c, 0xa2, 0xfc, 0x34, 0x1f, 0xa7, 0xd2, 0xbc, 0x64, 0x13, 0xe5, 0xad, 0x79, 0x4e, 0x94,
	0x29, 0xbf, 0xb2, 0x05, 0x25, 0xb4, 0xd4, 0x32, 0x13, 0x56, 0x8d, 0xff, 0xae, 0x5e, 0xf9, 0xe2,
	0x33, 0x00, 0x00, 0xff, 0xff, 0x28, 0x91, 0x8f, 0xe2, 0x25, 0x02, 0x00, 0x00,
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConnInterface

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion6

// InWorkspaceHelperClient is the client API for InWorkspaceHelper service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type InWorkspaceHelperClient interface {
	// BackupCanary can prepare workspace content backups. The canary is supposed to be triggered
	// when the workspace is about to shut down, e.g. using the PreStop hook of a Kubernetes container.
	//
	// Note that the request/response flow is inverted here, as it's the server (supervisor) which requests a backup
	// from the client (ws-sync).
	BackupCanary(ctx context.Context, opts ...grpc.CallOption) (InWorkspaceHelper_BackupCanaryClient, error)
	// PauseTheia can pause the Theia process and all its children. As long as the request stream
	// is held Theia will be paused.
	// This is a stop-the-world mechanism for preventing concurrent modification during backup.
	PauseTheia(ctx context.Context, opts ...grpc.CallOption) (InWorkspaceHelper_PauseTheiaClient, error)
	GitStatus(ctx context.Context, in *GitStatusRequest, opts ...grpc.CallOption) (*GitStatusResponse, error)
}

type inWorkspaceHelperClient struct {
	cc grpc.ClientConnInterface
}

func NewInWorkspaceHelperClient(cc grpc.ClientConnInterface) InWorkspaceHelperClient {
	return &inWorkspaceHelperClient{cc}
}

func (c *inWorkspaceHelperClient) BackupCanary(ctx context.Context, opts ...grpc.CallOption) (InWorkspaceHelper_BackupCanaryClient, error) {
	stream, err := c.cc.NewStream(ctx, &_InWorkspaceHelper_serviceDesc.Streams[0], "/wsbs.InWorkspaceHelper/BackupCanary", opts...)
	if err != nil {
		return nil, err
	}
	x := &inWorkspaceHelperBackupCanaryClient{stream}
	return x, nil
}

type InWorkspaceHelper_BackupCanaryClient interface {
	Send(*BackupCanaryResponse) error
	Recv() (*BackupCanaryRequest, error)
	grpc.ClientStream
}

type inWorkspaceHelperBackupCanaryClient struct {
	grpc.ClientStream
}

func (x *inWorkspaceHelperBackupCanaryClient) Send(m *BackupCanaryResponse) error {
	return x.ClientStream.SendMsg(m)
}

func (x *inWorkspaceHelperBackupCanaryClient) Recv() (*BackupCanaryRequest, error) {
	m := new(BackupCanaryRequest)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *inWorkspaceHelperClient) PauseTheia(ctx context.Context, opts ...grpc.CallOption) (InWorkspaceHelper_PauseTheiaClient, error) {
	stream, err := c.cc.NewStream(ctx, &_InWorkspaceHelper_serviceDesc.Streams[1], "/wsbs.InWorkspaceHelper/PauseTheia", opts...)
	if err != nil {
		return nil, err
	}
	x := &inWorkspaceHelperPauseTheiaClient{stream}
	return x, nil
}

type InWorkspaceHelper_PauseTheiaClient interface {
	Send(*PauseTheiaRequest) error
	CloseAndRecv() (*PauseTheiaResponse, error)
	grpc.ClientStream
}

type inWorkspaceHelperPauseTheiaClient struct {
	grpc.ClientStream
}

func (x *inWorkspaceHelperPauseTheiaClient) Send(m *PauseTheiaRequest) error {
	return x.ClientStream.SendMsg(m)
}

func (x *inWorkspaceHelperPauseTheiaClient) CloseAndRecv() (*PauseTheiaResponse, error) {
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	m := new(PauseTheiaResponse)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *inWorkspaceHelperClient) GitStatus(ctx context.Context, in *GitStatusRequest, opts ...grpc.CallOption) (*GitStatusResponse, error) {
	out := new(GitStatusResponse)
	err := c.cc.Invoke(ctx, "/wsbs.InWorkspaceHelper/GitStatus", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// InWorkspaceHelperServer is the server API for InWorkspaceHelper service.
type InWorkspaceHelperServer interface {
	// BackupCanary can prepare workspace content backups. The canary is supposed to be triggered
	// when the workspace is about to shut down, e.g. using the PreStop hook of a Kubernetes container.
	//
	// Note that the request/response flow is inverted here, as it's the server (supervisor) which requests a backup
	// from the client (ws-sync).
	BackupCanary(InWorkspaceHelper_BackupCanaryServer) error
	// PauseTheia can pause the Theia process and all its children. As long as the request stream
	// is held Theia will be paused.
	// This is a stop-the-world mechanism for preventing concurrent modification during backup.
	PauseTheia(InWorkspaceHelper_PauseTheiaServer) error
	GitStatus(context.Context, *GitStatusRequest) (*GitStatusResponse, error)
}

// UnimplementedInWorkspaceHelperServer can be embedded to have forward compatible implementations.
type UnimplementedInWorkspaceHelperServer struct {
}

func (*UnimplementedInWorkspaceHelperServer) BackupCanary(srv InWorkspaceHelper_BackupCanaryServer) error {
	return status.Errorf(codes.Unimplemented, "method BackupCanary not implemented")
}
func (*UnimplementedInWorkspaceHelperServer) PauseTheia(srv InWorkspaceHelper_PauseTheiaServer) error {
	return status.Errorf(codes.Unimplemented, "method PauseTheia not implemented")
}
func (*UnimplementedInWorkspaceHelperServer) GitStatus(ctx context.Context, req *GitStatusRequest) (*GitStatusResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GitStatus not implemented")
}

func RegisterInWorkspaceHelperServer(s *grpc.Server, srv InWorkspaceHelperServer) {
	s.RegisterService(&_InWorkspaceHelper_serviceDesc, srv)
}

func _InWorkspaceHelper_BackupCanary_Handler(srv interface{}, stream grpc.ServerStream) error {
	return srv.(InWorkspaceHelperServer).BackupCanary(&inWorkspaceHelperBackupCanaryServer{stream})
}

type InWorkspaceHelper_BackupCanaryServer interface {
	Send(*BackupCanaryRequest) error
	Recv() (*BackupCanaryResponse, error)
	grpc.ServerStream
}

type inWorkspaceHelperBackupCanaryServer struct {
	grpc.ServerStream
}

func (x *inWorkspaceHelperBackupCanaryServer) Send(m *BackupCanaryRequest) error {
	return x.ServerStream.SendMsg(m)
}

func (x *inWorkspaceHelperBackupCanaryServer) Recv() (*BackupCanaryResponse, error) {
	m := new(BackupCanaryResponse)
	if err := x.ServerStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func _InWorkspaceHelper_PauseTheia_Handler(srv interface{}, stream grpc.ServerStream) error {
	return srv.(InWorkspaceHelperServer).PauseTheia(&inWorkspaceHelperPauseTheiaServer{stream})
}

type InWorkspaceHelper_PauseTheiaServer interface {
	SendAndClose(*PauseTheiaResponse) error
	Recv() (*PauseTheiaRequest, error)
	grpc.ServerStream
}

type inWorkspaceHelperPauseTheiaServer struct {
	grpc.ServerStream
}

func (x *inWorkspaceHelperPauseTheiaServer) SendAndClose(m *PauseTheiaResponse) error {
	return x.ServerStream.SendMsg(m)
}

func (x *inWorkspaceHelperPauseTheiaServer) Recv() (*PauseTheiaRequest, error) {
	m := new(PauseTheiaRequest)
	if err := x.ServerStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func _InWorkspaceHelper_GitStatus_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GitStatusRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(InWorkspaceHelperServer).GitStatus(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/wsbs.InWorkspaceHelper/GitStatus",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(InWorkspaceHelperServer).GitStatus(ctx, req.(*GitStatusRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var _InWorkspaceHelper_serviceDesc = grpc.ServiceDesc{
	ServiceName: "wsbs.InWorkspaceHelper",
	HandlerType: (*InWorkspaceHelperServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "GitStatus",
			Handler:    _InWorkspaceHelper_GitStatus_Handler,
		},
	},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "BackupCanary",
			Handler:       _InWorkspaceHelper_BackupCanary_Handler,
			ServerStreams: true,
			ClientStreams: true,
		},
		{
			StreamName:    "PauseTheia",
			Handler:       _InWorkspaceHelper_PauseTheia_Handler,
			ClientStreams: true,
		},
	},
	Metadata: "workspace.proto",
}