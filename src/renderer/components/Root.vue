<template>
  <el-container>
    <el-header></el-header>
    <el-main>
      <el-dialog
        title="Downloading..."
        :visible.sync="showDialog"
        :show-close="false"
        :close-on-click-modal="false"
        width="300px"
      >
        <div v-if="nowLoading" class="sk-wave">
          <div class="sk-rect sk-rect1"></div>
          <div class="sk-rect sk-rect2"></div>
          <div class="sk-rect sk-rect3"></div>
          <div class="sk-rect sk-rect4"></div>
          <div class="sk-rect sk-rect5"></div>
        </div>
        <div v-else>
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            color="rgba(201, 23, 30, 1.0)"
            :percentage="progress"
          ></el-progress>
          <p class="progress-info">{{ now }} / {{ max }}</p>
        </div>
        <div style="text-align: right;">
          <el-button type="danger" @click="cancel()">キャンセル</el-button>
        </div>
      </el-dialog>

      <el-form>
        <el-form-item>
          <el-input placeholder="URL" v-model="url"></el-input>
        </el-form-item>
        <div style="text-align: right;">
          <el-row>
            <el-switch
              v-model="doArchive"
              active-text="ZIPにまとめて保存"
            ></el-switch>
          </el-row>
          <el-row>
            <el-button type="primary" @click="download()">Download</el-button>
          </el-row>
        </div>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import { ipcRenderer } from "electron"; // eslint-disable-line
import { Notification } from "element-ui";

const data = {
  url: "",
  showDialog: false,
  nowLoading: true,
  doArchive: false,
  max: 0,
  now: 0
};

ipcRenderer.on("selectedLocation", (event, location) => {
  data.showDialog = true;
  ipcRenderer.send("download", data.url, location);
});

ipcRenderer.on("canceled", () => {
  data.showDialog = false;
  data.nowLoading = true;
  data.max = 0;
  data.now = 0;
  Notification.warning("処理をキャンセルしました");
});
ipcRenderer.on("update-max", (event, args) => {
  const [total] = args;
  data.max = total;
});
ipcRenderer.on("startDownload", () => {
  data.nowLoading = false;
});
ipcRenderer.on("update-now", () => {
  data.now += 1;
});
ipcRenderer.on("complete", () => {
  data.url = "";
  data.showDialog = false;
  data.nowLoading = true;
  data.max = 0;
  data.now = 0;
  Notification.success("ダウンロードが完了しました");
});
ipcRenderer.on("error", () => {
  Notification.warning({
    message: "ダウンロード中にエラーが発生しています",
    duration: 0
  });
});

export default {
  name: "Root",
  data() {
    return data;
  },
  methods: {
    download() {
      ipcRenderer.send("selectStoreLocation");
    },
    cancel() {
      ipcRenderer.send("cancel");
    }
  },
  computed: {
    progress() {
      return Math.round((data.now / data.max) * 100);
    }
  }
};
</script>

<style>
@import "../../../node_modules/spinkit/css/spinkit.css";

.el-dialog {
  background-color: rgba(48, 40, 51, 0.7);
}
.el-dialog__title {
  color: rgba(229, 228, 230, 1);
}

.sk-wave {
  margin-top: 10px;
}
.sk-rect.sk-rect1,
.sk-rect.sk-rect2,
.sk-rect.sk-rect3,
.sk-rect.sk-rect4,
.sk-rect.sk-rect5 {
  background-color: rgba(229, 228, 230, 1);
}

.progress-info {
  margin-top: 0;
  text-align: right;
  color: rgba(229, 228, 230, 1);
  font-size: 12px;
}
</style>
