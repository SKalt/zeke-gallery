.PHONY: dev-server archive deployment
dev-server:
	sh ./scripts/dev_server.sh
deployment:
	./scripts/deploy.sh
archive.tar.gz:
	git archive --format tar HEAD | gzip > archive.tar.gz
archive: archive.tar.gz
