O=-O3
CFLAGS=$(O) -Wall -I ed25519
EXPORTED_FUNCTIONS=_malloc,_free,_ed25519_keypair,_ed25519_sign
BUILD_FLAGS=--no-entry -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS)

src=ed25519/keypair.c ed25519/sign.c \
	ed25519/ge.c ed25519/fe.c ed25519/sc_muladd.c ed25519/sc_reduce.c \
	ed25519/sha512/hash.c ed25519/sha512/blocks/blocks.c ed25519/verify32/verify.c
objects=$(src:.c=.wasm.o)

outdir=build
$(shell if [ ! -d $(outdir) ]; then mkdir $(outdir); fi)
outfile=$(outdir)/ed25519.wasm

$(outfile): $(objects)
	emcc -o $(outfile) $(objects) $(CFLAGS) $(BUILD_FLAGS)

ed25519/%.wasm.o: ed25519/%.c
	emcc -c -o $@ $< $(CFLAGS)

prepare:
	if [ ! -d ed25519 ]; then $(SHELL) prepare.sh; fi
.PHONY: prepare

clean:
	rm -rf $(objects) $(outdir) ed25519
.PHONY: prepare
