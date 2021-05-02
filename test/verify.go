package main

import (
	"crypto/ed25519"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"strings"
)

func getInput() (message, signature, publicKey []byte) {
	file, err := ioutil.ReadFile("test/message.txt")
	if err != nil {
		panic(err)
	}
	lines := strings.Split(string(file), "\n")

	message, _ = base64.StdEncoding.DecodeString(lines[0])
	signature, _ = base64.StdEncoding.DecodeString(lines[1])
	publicKey, _ = base64.StdEncoding.DecodeString(lines[2])
	return message, signature, publicKey
}

func main() {
	message, signature, publicKey := getInput()

	if ed25519.Verify(publicKey, message, signature) {
		fmt.Println("Verification succeeded")
	} else {
		fmt.Println("Verification failed")
	}
}
