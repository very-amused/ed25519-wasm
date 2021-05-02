O=-O3
OUTDIR=build
SRC=ed25519/{keypair,sign}.c ed25519/{ge,fe,sc_muladd,sc_reduce}.c ed25519/sha512/hash.c ed25519/sha512/blocks/blocks.c ed25519/verify32/verify.c
LINK=-I ed25519
EXPORTED_FUNCTIONS=_malloc,_free,_ed25519_keypair,_ed25519_sign
CFLAGS=$(O) -Wall --no-entry \
	-s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS)
EMCC=emcc $(CFLAGS) $(LINK) --no-entry -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) $(SRC)

all: build-dir release

build-dir:
	[ -d "$(OUTDIR)" ] || mkdir "$(OUTDIR)"

release:
	$(EMCC) -o $(OUTDIR)/ed25519.wasm

prepare:
	sh prepare.sh
