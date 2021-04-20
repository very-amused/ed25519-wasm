O=-O3
EXPORTED_FUNCTIONS="['_malloc', '_free', '_ed25519_keypair', '_ed25519_sign']"
INCLUDE=ed25519/ed25519.h
SRC=ed25519/{keypair,sign}.c ed25519/{ge,fe,sc_muladd,sc_reduce}.c ed25519/sha512/hash.c ed25519/sha512/blocks/blocks.c ed25519/verify32/verify.c
DEBUG_FLAGS=-g

all:
	emcc $(O) --no-entry -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) -I $(INCLUDE) $(SRC) -o ed25519.wasm

debug:
	emcc $(DEBUG_FLAGS) --no-entry -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) -I $(INCLUDE) $(SRC) -o ed25519.wasm

prepare:
	sh prepare.sh
