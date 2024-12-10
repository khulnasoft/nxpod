/**
 * Copyright (c) 2024 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

export const PREDEFINED_REPOS = [
    {
        url: "https://github.com/nxpod-demos/voting-app",
        repoName: "demo-docker",
        description: "A fully configured demo with Docker Compose, Redis and Postgres",
        repoPath: "github.com/nxpod-demos/voting-app",
    },
    {
        url: "https://github.com/nxpod-demos/spring-petclinic",
        repoName: "demo-java",
        description: "A fully configured demo with Java, Maven and Spring Boot",
        repoPath: "github.com/nxpod-demos/spring-petclinic",
    },
] as const;
