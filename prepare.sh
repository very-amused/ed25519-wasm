#! /bin/sh

# Build a portable WASM binary of Daniel J. Bernstein's ref10 implementation of the ed25519 signature algorithm.
SUPERCOP_VERSION=20211108
SUPERCOP_SRC=supercop-${SUPERCOP_VERSION}

get_supercop() {
  [ -d $SUPERCOP_SRC ] && return
  curl -o supercop.tar.xz https://bench.cr.yp.to/supercop/supercop-${SUPERCOP_VERSION}.tar.xz
  bsdtar xf supercop.tar.xz
  rm -rf supercop.tar.xz
}

# Extract the source for crypto_sign/ed25519, crypto_hash/sha512, crypto_hashblocks/sha512, and crypto_verify/32
extract_sources() {
  cp -r ${SUPERCOP_SRC}/crypto_sign/ed25519/ref10 ed25519
  cp -r ${SUPERCOP_SRC}/crypto_hash/sha512/ref ed25519/sha512
  cp -r ${SUPERCOP_SRC}/crypto_hashblocks/sha512/ref ed25519/sha512/blocks
  cp -r ${SUPERCOP_SRC}/crypto_verify/32/ref ed25519/verify32
}

# Remove benchmark related info
clean_sources() {
  for dir in $(find ed25519 -type d); do
    rm $dir/goal-* &> /dev/null
  done
}

organize_sources() {
  group=$1
  all=ed25519/$group.c
  echo "#include \"${group}.h\"" > $all
  for s in ed25519/${group}_*.c; do
    echo "" >> $all
    echo "/* $s */" >> $all
    echo "" >> $all
    cat $s | sed -r "/#include \"(crypto_u?int[0-9]+|crypto_verify_32|${group})\.h\"/d"  >> $all
    rm -f $s
  done
}

patch_ints() {
  # Apply int definitions from stdint.h
  # Also remove CRYPTO_NAMESPACE definitions
  patch ed25519/fe.h patches/fe.diff
  patch ed25519/ge.h patches/ge.diff
}

patch_verify32() {
  cp include/verify32.h ed25519/verify32/verify.h

  patch ed25519/verify32/verify.c patches/verify32.diff
}

patch_sha512() {
  cp include/sha512_blocks.h ed25519/sha512/blocks/blocks.h
  cp include/sha512.h ed25519/sha512/sha512.h

  patch ed25519/sha512/blocks/blocks.c patches/sha512_blocks.diff
  patch ed25519/sha512/hash.c patches/sha512.diff
}

patch_ed25519() {
  cp include/ed25519.h ed25519/ed25519.h

  patch ed25519/keypair.c patches/keypair.diff
  patch -d ed25519 -i ../patches/sc.diff
  patch ed25519/sign.c patches/sign.diff
}

[ -x ed25519 ] && rm -rf ed25519
get_supercop
extract_sources
clean_sources
organize_sources fe
organize_sources ge
patch_ints
patch_verify32
patch_sha512
patch_ed25519