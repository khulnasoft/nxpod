// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package cmd

import (
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/khulnasoft/nxpod/nxpod-cli/pkg/nxpodlib"
	"github.com/khulnasoft/nxpod/nxpod-cli/pkg/theialib"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	yaml "gopkg.in/yaml.v2"
)

var (
	interactive = false
	minimal     = false
)

// initCmd initializes the workspace's .nxpod.yml file
var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Create a Nxpod configuration for this project.",
	Long: `
Create a Nxpod configuration for this project.
	`,
	Run: func(cmd *cobra.Command, args []string) {
		cfg := nxpodlib.NxpodFile{}
		if interactive {
			if err := askForDockerImage(&cfg); err != nil {
				log.Fatal(err)
			}
			if err := askForPorts(&cfg); err != nil {
				log.Fatal(err)
			}
			if err := askForTask(&cfg); err != nil {
				log.Fatal(err)
			}
		} else {
			if !minimal {
				cfg.SetImage(nxpodlib.NxpodImage{
					File:    ".nxpod.Dockerfile",
					Context: "",
				})
				cfg.AddPort(3000)
				cfg.AddTask("echo 'start script'", "echo 'init script'")
			} else {
				cfg.AddTask("echo 'start script'", "echo 'init script'")
			}
		}

		d, err := yaml.Marshal(cfg)
		if err != nil {
			log.Fatal(err)
		}
		if !interactive {
			if !minimal {
				d = []byte(`image:
  file: .nxpod.Dockerfile

# List the ports you want to expose and what to do when they are served. See https://www.nxpod.io/docs/config-ports/
ports:
  - port: 3000
    onOpen: open-preview

# List the start up tasks. You can start them in parallel in multiple terminals. See https://www.nxpod.io/docs/config-start-tasks/
tasks:
  - init: echo 'init script' # runs during prebuild
    command: echo 'start script'
`)
			} else {
				d = []byte(`tasks:
  - init: echo 'init script' # runs during prebuild
    command: echo 'start script'
`)
			}

		} else {
			fmt.Printf("\n\n---\n%s", d)
		}

		if _, err := os.Stat(".nxpod.yml"); err == nil {
			prompt := promptui.Prompt{
				IsConfirm: true,
				Label:     ".nxpod.yml file already exists, overwrite?",
			}
			if _, err := prompt.Run(); err != nil {
				fmt.Printf("Not overwriting .nxpod.yml file. Aborting.\n")
				os.Exit(1)
				return
			}
		}

		if err := ioutil.WriteFile(".nxpod.yml", d, 0644); err != nil {
			log.Fatal(err)
		}

		// open .nxpod.yml and Dockerfile
		service, err := theialib.NewServiceFromEnv()
		if err != nil {
			log.Fatal(err)
		}

		_, err = service.OpenFile(theialib.OpenFileRequest{Path: ".nxpod.yml"})
		if err != nil {
			log.Fatal(err)
		}
		if v, ok := cfg.Image.(nxpodlib.NxpodImage); ok {
			if _, err := os.Stat(v.File); os.IsNotExist(err) {
				if err := ioutil.WriteFile(v.File, []byte(`FROM nxpod/workspace-full

USER nxpod

# Install custom tools, runtime, etc. using apt-get
# For example, the command below would install "bastet" - a command line tetris clone:
#
# RUN sudo apt-get -q update && \
#     sudo apt-get install -yq bastet && \
#     sudo rm -rf /var/lib/apt/lists/*
#
# More information: https://www.nxpod.io/docs/config-docker/
`), 0644); err != nil {
					log.Fatal(err)
				}
			}

			_, err := service.OpenFile(theialib.OpenFileRequest{Path: v.File})
			if err != nil {
				log.Fatal(err)
			}
		}
	},
}

func isRequired(input string) error {
	if input == "" {
		return errors.New("Cannot be empty")
	}
	return nil
}

func ask(lbl string, def string, validator promptui.ValidateFunc) (string, error) {
	scslbl := strings.Trim(strings.Split(lbl, "(")[0], " ")
	prompt := promptui.Prompt{
		Label:    lbl,
		Validate: validator,
		Default:  def,
		Templates: &promptui.PromptTemplates{
			Success: fmt.Sprintf("%s: ", scslbl),
		},
	}
	return prompt.Run()
}

func askForDockerImage(cfg *nxpodlib.NxpodFile) error {
	prompt := promptui.Select{
		Label: "Workspace Docker image",
		Items: []string{"default", "custom image", "docker file"},
		Templates: &promptui.SelectTemplates{
			Selected: "Workspace Image: {{ . }}",
		},
	}
	chce, _, err := prompt.Run()
	if err != nil {
		return err
	}

	if chce == 0 {
		return nil
	}
	if chce == 1 {
		nme, err := ask("Image name", "", isRequired)
		if err != nil {
			return err
		}
		cfg.SetImageName(nme)
		return nil
	}

	// configure docker file
	dockerFile, err := ask("Dockerfile path", ".nxpod.Dockerfile", isRequired)
	if err != nil {
		return err
	}
	ctxtPath, err := ask("Docker context path (enter to skip)", "", nil)
	if err != nil {
		return err
	}
	cfg.SetImage(nxpodlib.NxpodImage{
		File:    dockerFile,
		Context: ctxtPath,
	})
	return nil
}

func parsePorts(input string) ([]int32, error) {
	if input == "" {
		return []int32{}, nil
	}
	prts := strings.Split(input, ",")
	rst := make([]int32, 0)
	for _, prt := range prts {
		if pv, err := strconv.ParseInt(strings.Trim(prt, " "), 10, 32); err != nil {
			return nil, err
		} else if 0 < pv && pv <= 65535 {
			rst = append(rst, int32(pv))
		} else {
			return nil, fmt.Errorf("%d: port is out of range", pv)
		}
	}
	return rst, nil
}

func askForPorts(cfg *nxpodlib.NxpodFile) error {
	input, err := ask("Expose Ports (comma separated)", "", func(input string) error {
		if _, err := parsePorts(input); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return err
	}

	prts, err := parsePorts(input)
	if err != nil {
		return err
	}

	for _, pv := range prts {
		cfg.AddPort(pv)
	}
	return nil
}

func askForTask(cfg *nxpodlib.NxpodFile) error {
	input, err := ask("Startup task (enter to skip)", "", nil)
	if err != nil {
		return err
	}
	if input != "" {
		cfg.AddTask(input)
	}

	return nil
}

func init() {
	rootCmd.AddCommand(initCmd)
	initCmd.Flags().BoolVarP(&interactive, "interactive", "i", false, "walk me through an interactive setup.")
	initCmd.Flags().BoolVarP(&minimal, "minimal", "m", false, "Create a minimal Nxpod configuration without a Dockerfile")
}
