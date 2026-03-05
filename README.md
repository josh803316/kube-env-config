# @josh803316/kube-env-config

Config-driven Kubernetes environment management CLI (`kec`).

## Install

```sh
# From GitHub Packages
npm install -g @josh803316/kube-env-config
```

Or run directly with bun:

```sh
bun run src/cli/index.ts <command>
```

## Configuration

Create a `kec.config.ts` in your project root (auto-discovered by walking up from `cwd`):

```typescript
import { defineConfig } from '@josh803316/kube-env-config'

export default defineConfig({
  templateSource: {
    type: 'namespace',       // read templates from a k8s namespace
    namespace: 'default',
    // OR:
    // type: 'file',
    // dir: './k8s',
  },
  protectedNamespaces: ['my-prod-ns'],   // merged with built-in defaults
  protectedEnvironments: ['prod', 'preprod'],
  services: {
    api: {
      allowedResources: ['deployment', 'service', 'ingress', 'configmap'],
    },
  },
  transforms: {
    deployment: async (resource, ctx) => {
      // custom transforms per resource type
      return resource;
    },
  },
})
```

## CLI Commands

```
kec create   -r <type> -n <ns> [--service <svc>] [--image <img>] [--manifest <file>] [--dry-run] [-e <env>]
kec delete   -r <type> -n <ns> [--service <svc>] [-e <env>] [--dry-run]
kec read     -r <type> -n <ns> --name <name>
kec list     -r <type> -n <ns>
kec patch    -r <type> -n <ns> --name <name> --manifest <file> [--dry-run]
kec health-check -n <ns> --name <name> [--timeout <seconds>]
```

**Resource types:** `namespace`, `configmap`, `secret`, `ingress`, `serviceaccount`, `role`, `rolebinding`, `deployment`, `pv`, `pvc`, `service`

### Examples

```sh
# Dry-run create a deployment from a local manifest
kec create -r deployment -n my-ns --image ghcr.io/org/app:sha-abc123 --manifest ./k8s/deployment.yaml --dry-run

# Apply to cluster
kec create -r deployment -n my-ns --image ghcr.io/org/app:sha-abc123 --manifest ./k8s/deployment.yaml

# List all deployments in a namespace
kec list -r deployment -n my-ns

# Delete all configmaps in a namespace
kec delete -r configmap -n my-ns

# Poll health for a deployment
kec health-check -n my-ns --name my-app --timeout 120
```

## How It Works

1. Loads `kec.config.ts` from the nearest ancestor directory
2. Checks protected namespaces/environments (guard)
3. Resolves the template: from a source k8s namespace or a local YAML/JSON file
4. Applies transforms: strip metadata → replace namespace → set image → user custom transforms
5. Creates or patches the resource (create falls back to patch on 409 conflict)

## Publishing

Tagged `v*` pushes trigger the GitHub Actions workflow that publishes to GitHub Packages.

```sh
git tag v1.0.0 && git push --tags
```
