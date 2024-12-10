// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package config

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"reflect"
	"sync"
	"time"

	nxpod "github.com/khulnasoft/nxpod/nxpod-protocol"
	"github.com/sirupsen/logrus"
)

var emptyConfig = &nxpod.NxpodConfig{}

type ConfigAnalyzer struct {
	log    *logrus.Entry
	report func(field string)
	delay  time.Duration
	prev   *nxpod.NxpodConfig
	timer  *time.Timer
	mu     sync.RWMutex
}

func NewConfigAnalyzer(
	log *logrus.Entry,
	delay time.Duration,
	report func(field string),
	initial *nxpod.NxpodConfig,
) *ConfigAnalyzer {
	prev := emptyConfig
	if initial != nil {
		prev = initial
	}
	log.WithField("initial", prev).Debug("nxpod config analytics: initialized")
	return &ConfigAnalyzer{
		log:    log,
		delay:  delay,
		report: report,
		prev:   prev,
	}
}

func (a *ConfigAnalyzer) Analyse(cfg *nxpod.NxpodConfig) <-chan struct{} {
	current := emptyConfig
	if cfg != nil {
		current = cfg
	}

	a.log.Debug("nxpod config analytics: scheduling")
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.timer != nil && !a.timer.Stop() {
		a.log.WithField("cfg", current).Debug("nxpod config analytics: cancelled")
		<-a.timer.C
	}

	done := make(chan struct{})
	a.timer = time.AfterFunc(a.delay, func() {
		a.mu.Lock()
		defer a.mu.Unlock()
		a.process(current)
		a.timer = nil
		close(done)
	})
	return done
}

func (a *ConfigAnalyzer) process(current *nxpod.NxpodConfig) {
	a.log.Debug("nxpod config analytics: processing")

	fields := a.computeFields(a.prev, current)
	for _, field := range fields {
		if a.diffByField(a.prev, current, field) {
			a.report(field)
		}
	}

	a.log.WithField("current", current).
		WithField("prev", a.prev).
		WithField("fields", fields).
		Debug("nxpod config analytics: processed")

	a.prev = current
}

func (a *ConfigAnalyzer) computeFields(configs ...*nxpod.NxpodConfig) []string {
	defer func() {
		if err := recover(); err != nil {
			a.log.WithField("error", err).Error("nxpod config analytics: failed to compute nxpod config fields")
		}
	}()
	var fields []string
	uniqueKeys := make(map[string]struct{})
	for _, cfg := range configs {
		if cfg == nil {
			continue
		}
		cfgType := reflect.ValueOf(*cfg).Type()
		if cfgType.Kind() == reflect.Struct {
			for i := 0; i < cfgType.NumField(); i++ {
				Name := cfgType.Field(i).Name
				_, seen := uniqueKeys[Name]
				if !seen {
					uniqueKeys[Name] = struct{}{}
					fields = append(fields, Name)
				}
			}
		}
	}
	return fields
}

func (a *ConfigAnalyzer) valueByField(config *nxpod.NxpodConfig, field string) interface{} {
	defer func() {
		if err := recover(); err != nil {
			a.log.WithField("error", err).WithField("field", field).Error("nxpod config analytics: failed to retrieve value from nxpod config")
		}
	}()
	if config == nil {
		return nil
	}
	return reflect.ValueOf(*config).FieldByName(field).Interface()
}

func (a *ConfigAnalyzer) computeHash(i interface{}) (string, error) {
	b, err := json.Marshal(i)
	if err != nil {
		return "", err
	}
	h := sha256.New()
	_, err = h.Write(b)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", h.Sum(nil)), nil
}

func (a *ConfigAnalyzer) diffByField(prev *nxpod.NxpodConfig, current *nxpod.NxpodConfig, field string) bool {
	defer func() {
		if err := recover(); err != nil {
			a.log.WithField("error", err).WithField("field", field).Error("nxpod config analytics: failed to compare nxpod configs")
		}
	}()
	prevValue := a.valueByField(prev, field)
	prevHash, _ := a.computeHash(prevValue)
	currentValue := a.valueByField(current, field)
	currHash, _ := a.computeHash(currentValue)
	return prevHash != currHash
}
