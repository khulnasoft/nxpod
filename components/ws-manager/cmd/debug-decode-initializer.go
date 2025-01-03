// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package cmd

import (
	"encoding/base64"
	"fmt"
	"os"

	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/proto"
	csapi "github.com/khulnasoft/nxpod/content-service/api"

	"github.com/spf13/cobra"
)

// debugDecodeImageSpec represents the debugHeadlessLog command
var debugDecodeImageSpec = &cobra.Command{
	Use:   "decode-initalizer <str>",
	Short: "Decodes and marshals an image spec to JSON from a base64-encoded protobuf string",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		initializerPB, err := base64.StdEncoding.DecodeString(args[0])
		if err != nil {
			return fmt.Errorf("cannot decode init config: %w", err)
		}

		var initializer csapi.WorkspaceInitializer
		err = proto.Unmarshal(initializerPB, &initializer)
		if err != nil {
			return fmt.Errorf("cannot unmarshal init config: %w", err)
		}

		m := &jsonpb.Marshaler{
			EnumsAsInts: false,
			Indent:      "  ",
		}
		return m.Marshal(os.Stdout, &initializer)
	},
}

func init() {
	debugCmd.AddCommand(debugDecodeImageSpec)
}
