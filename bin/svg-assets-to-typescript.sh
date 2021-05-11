#!/bin/bash
ASSETS=`realpath $1`
ASSETS_DIR=`dirname $ASSETS`
ASSETS_FILE_NAME=`basename $ASSETS`

OUTPUT=`realpath $2`
OUTPUT_DIR=`dirname $OUTPUT`
OUTPUT_FILE_NAME=`basename $OUTPUT`

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

docker build -t svg-assets-to-typescript $DIR/..
docker run -v $ASSETS_DIR:/assets -v $OUTPUT_DIR:/output -it svg-assets-to-typescript npm run extract --input=/assets/$ASSETS_FILE_NAME --output=/output/$OUTPUT_FILE_NAME
