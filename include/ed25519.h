int ed25519_keypair(unsigned char *seed, unsigned char *pk, unsigned char *sk);
int ed25519_sign(unsigned char *sm, const unsigned char *m, unsigned long mlen, const unsigned char *sk);