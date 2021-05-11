$ASSETS = Resolve-Path  $args[0] | select -ExpandProperty Path
$ASSETS_DIR = [System.IO.Path]::GetDirectoryName($ASSETS)
$ASSETS_FILE_NAME = ([System.IO.Path]::GetFileName($args[0]))

$OUTPUT_DIR = Resolve-Path ([System.IO.Path]::GetDirectoryName($args[1])) | select -ExpandProperty Path
$OUTPUT_FILE_NAME = ([System.IO.Path]::GetFileName($args[1]))

docker build -t svg-assets-to-typescript $PSScriptRoot\..
docker run -v ${ASSETS_DIR}:/assets -v ${OUTPUT_DIR}:/output -it svg-assets-to-typescript npm run extract --input=/assets/${ASSETS_FILE_NAME} --output=/output/${OUTPUT_FILE_NAME}
