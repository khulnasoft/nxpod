// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
/// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package main

import (
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"github.com/hpcloud/tail"
	"github.com/pterm/pterm"
	"gopkg.in/segmentio/analytics-go.v3"
)

const (
	telemetryEvent = "localpreview_status"
)

var (
	segmentIOToken string
	msgs           = []struct {
		Fail    string
		Success string
		Status  string

		Msg string
	}{
		{Msg: "checking prerequisites", Fail: "requires a system with at least", Success: "Nxpod Domain:", Status: "checking prerequisites"},
		{Msg: "preparing system", Success: "extracting images to download ahead"},
		{Msg: "downloading images", Success: "images pulled"},
		{Msg: "preparing Nxpod preview installation", Success: "manifests generated"},
		{Msg: "starting Nxpod", Success: "Nxpod pods are ready", Status: "starting nxpod"},
		{Msg: fmt.Sprintf("Nxpod is running. Visit https://%s to access the dashboard", os.Getenv("DOMAIN")), Status: "nxpod ready"},
	}
)

func main() {
	// Warn and wait for user approval
	pterm.FgLightCyan.Println(`
Welcome to the local preview of Nxpod. Please note the following limitations:
  - Performance is limited by the capabilities of your machine - a minimum of 4 cores and 6GB of RAM are required
  - ARM CPUs including Macs with Apple Silicon (e.g. M1) are currently not supported
For more information about these limitation, please visit the local preview documentation: https://www.nxpod.khulnasoft.com/docs/self-hosted/latest/local-preview`)

	result, _ := pterm.DefaultInteractiveConfirm.WithDefaultText("Continue?").WithDefaultValue(true).Show()
	if !result {
		// send telemetry for user exit
		send_telemetry("user exit")
		return
	}

	file, err := tail.TailFile("logs.txt", tail.Config{Follow: true})
	if err != nil {
		log.Fatal(err)
	}

	var msgIdx int
	lastSpinner, _ := pterm.DefaultSpinner.Start(msgs[msgIdx].Msg)
	// send Telemetry update for the first phase
	send_telemetry(msgs[msgIdx].Status)
	for tailLine := range file.Lines {
		line := tailLine.Text
		msg := msgs[msgIdx]
		var next bool
		switch {
		case msg.Fail != "" && strings.Contains(line, msg.Fail):
			lastSpinner.Fail()
			pterm.FgLightRed.Println("Failed with error: " + line)
			return
		case msg.Success != "" && strings.Contains(line, msg.Success):
			lastSpinner.Success()
			next = true
		}

		if !next {
			continue
		}

		msgIdx++
		if msgIdx >= len(msgs) {
			return
		}
		lastSpinner, _ = pterm.DefaultSpinner.Start(msgs[msgIdx].Msg)
		// send Telemetry for phase update
		send_telemetry(msgs[msgIdx].Status)

	}
	err = file.Err()
	if errors.Is(err, io.EOF) {
		err = nil
	}
	if err != nil {
		panic(err)
	}
}

func send_telemetry(status string) {
	if os.Getenv("DO_NOT_TRACK") != "1" && status != "" {
		if segmentIOToken == "" {
			panic("No segmentIOToken set during build")
		}

		client, _ := analytics.NewWithConfig(segmentIOToken, analytics.Config{})
		defer func() {
			client.Close()

		}()

		telemetry := analytics.Track{
			UserId: os.Getenv("USER_ID"),
			Event:  telemetryEvent,
			Properties: analytics.NewProperties().
				Set("status", status),
		}
		client.Enqueue(telemetry)
	}
}
