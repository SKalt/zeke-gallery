.PHONY: dev-server archive
dev-server:
	sh ./scripts/dev_server.sh
archive.tar.gz:
	git archive --format tar HEAD | gzip > archive.tar.gz
archive: archive.tar.gz
