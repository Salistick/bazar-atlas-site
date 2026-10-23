# Banco publicado

Copias consistentes dos bancos locais capturadas por `python build_pages.py --snapshot`.

- `bazar_atlas.sqlite3.gz`: catalogo ativo, historico local e snapshots usados no site.
- `acervo_bazar.sqlite3.gz`: acervo de IDs e proveniencia das fontes de coleta.
- `enrichment.sqlite3.gz`: resultados de enriquecimento ja existentes; publicar a copia nao reativa o coletor.
- `world_metadata.json`: metadados de mundos utilizados pelo catalogo.
- `manifest.json`: horario da captura, tamanhos e hashes SHA-256 dos arquivos compactados.

Arquivos gzip padrao, sem Git LFS. Depois de descompactados, abrem em qualquer leitor SQLite. Sao copias da data de captura; os coletores continuam atualizando os originais no computador.
