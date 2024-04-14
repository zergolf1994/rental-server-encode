const path = require("path");
const fs = require("fs-extra");
const { Client } = require("node-scp");

exports.SCPRemoteHLS = async ({ ssh, file }) => {
  try {
    const local_file = file.file_convert;
    const save_dir = file.remote_dir;
    if (!fs.existsSync(local_file)) throw new Error(`Local File Not found`);
    return new Promise(async function (resolve, reject) {
      Client(ssh)
        .then(async (client) => {
          //เข็คว่ามาโฟลเดอร์ไหม
          const dir_exists = await client
            .exists(save_dir)
            .then((result) => {
              return result;
            })
            .catch((error) => {
              //client.close();
              resolve({ error: true, msg: "check dir failed" });
            });
          //หากไม่มีให้สร้าง
          if (!dir_exists) {
            await client
              .mkdir(save_dir)
              .then((response) => {
                //console.log("dir created");
                return response;
              })
              .catch((error) => {
                //client.close();
                resolve({ error: true, msg: "create dir failed" });
              });
          }

          // เริ่มต้นการรีโหมท
          await client
            .uploadFile(local_file, `${save_dir}/${file.file_name}`)
            .then(async (response) => {
              //client.close();
              resolve({ msg: "remoted" });
            })
            .catch((error) => {
              //client.close();
              resolve({ error: true, msg: "remote failed" });
            });
        })
        .catch((e) => {
          //console.log("e", e);
          //client.close();
          resolve({ error: true, msg: "connect failed" });
        });
    });
  } catch (error) {
    return { error: true, msg: error?.message };
  }
};
