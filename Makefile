O=-O3
CFLAGS=$(O) -Wall
EXPORTED_FUNCTIONS=_malloc,_free,_ed25519_keypair,_ed25519_sign
BUILD_FLAGS=-s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) --no-entry -I ed25519

src=ed25519/keypair.c ed25519/sign.c \
	ed25519/ge.c ed25519/fe.c ed25519/sc_muladd.c ed25519/sc_reduce.c \
	ed25519/sha512/hash.c ed25519/sha512/blocks/blocks.c ed25519/verify32/verify.c
objects=$(src:.c=.wasm.o)

outdir=build
outfile=$(outdir)/ed25519.wasm

$(outfile): $(objects)
	if [ ! -d $(outdir) ]; then mkdir $(outdir); fi
	emcc -o $(outfile) $(objects) $(CFLAGS) $(BUILD_FLAGS)

ed25519/%.wasm.o: ed25519/%.c
	emcc -c -o $@ $< $(CFLAGS)

prepare:
	if [ ! -d ed25519 ]; then $(SHELL) prepare.sh; fi

clean:
	rm -rf $(objects) $(outdir)
