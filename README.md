cefizelj
========

vodič o obnovljivih virih za pic

----

## Deployment

Ta branch za pic vodič ima nastavljen auto build za docker image v github action, nima pa avtomatskega deploya na naš cluster.

Če hočeš deployat novo verzijo:
1. počakaj da build action konča
2. pullaj spremembe na svoj računalnik, da dobiš nov image tag v `kustomization.yaml`
3. lokalno poženi `kubectl apply -k ./kustomize`
