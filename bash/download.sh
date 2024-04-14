localhost="127.0.0.1"
data=$(curl -sLf "http://${localhost}/task/data" | jq -r ".")
error=$(echo $data | jq -r ".error")

if [[ $error == true ]]; then
    msg=$(echo $data | jq -r ".msg")
    echo "${msg}"
    exit 1
fi


task=$(echo $data | jq -r ".task")
encodeId=$(echo $data | jq -r ".encodeId")

if [[ $task != "prepare" ]]; then
    echo "Task: ${task}"
    exit 1
fi

curl -s "http://${localhost}/task/update/${encodeId}?task=download&percent=0" > /dev/null

save_dir=$(echo $data | jq ".save_dir"  --raw-output)
file_name=$(echo $data | jq ".file_name" --raw-output)
url_media=$(echo $data | jq -r ".url_media")

dl_path=${save_dir}/${file_name}
dl_txt=${save_dir}/default.txt
    
curl "${url_media}" -o ${dl_path} --progress-bar > ${dl_txt} 2>&1

echo "Downloaded"
sleep 1

#ส่งต่อไปยังประมวลผล
curl -s "http://${localhost}/encode" > /dev/null
exit 1