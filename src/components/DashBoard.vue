<template>
  <div class="container mt-4">
    <!-- 图表网格 -->
    <div class="row" v-for="(row, rowIndex) in rows" :key="rowIndex">
      <div class="col-3 mb-4" v-for="(chart, colIndex) in row" :key="colIndex">
        <div class="chart-container" @click="openModal(chart)">
          <div ref="charts" class="chart" :id="`chart-${rowIndex}-${colIndex}`"></div>
        </div>
      </div>
    </div>

    <!-- 模态框 -->
    <div class="modal fade" id="chartModal" tabindex="-1">
      <div class="modal-dialog modal-xl"> <!-- 设置更大的模态框 -->
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chart Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="modal-chart-container" class="modal-chart-container">
              <div ref="modalChart" id="modal-chart"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { Modal } from "bootstrap";

export default {
  data() {
    return {
      chartsData: Array.from({ length: 40 }, (_, i) => ({
        id: i,
        name: `Chart ${i + 1}`,
        data: this.generateRandomData(),
      })),
      modalChartInstance: null,
    };
  },
  computed: {
    rows() {
      return Array.from({ length: Math.ceil(this.chartsData.length / 4) }, (_, i) =>
        this.chartsData.slice(i * 4, (i + 1) * 4)
      );
    },
  },
  mounted() {
    this.initCharts();
  },
  methods: {
    initCharts() {
      this.chartsData.forEach((chart, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const chartDom = document.getElementById(`chart-${row}-${col}`);
        const myChart = echarts.init(chartDom);
        myChart.setOption({
          title: { text: chart.name, left: "center" },
          tooltip: {},
          xAxis: { type: "category", data: ["A", "B", "C", "D", "E"] },
          yAxis: { type: "value" },
          series: [{ type: "bar", data: chart.data }],
        });
      });
    },
    generateRandomData() {
      return Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
    },
    openModal(chart) {
      // 显示模态框
      const modal = new Modal(document.getElementById("chartModal"));
      modal.show();

      // 初始化模态框内的图表
      if (!this.modalChartInstance) {
        const modalChartDom = document.getElementById("modal-chart");
        this.modalChartInstance = echarts.init(modalChartDom);
      }

      // 更新模态框内的图表数据
      this.modalChartInstance.setOption({
        title: { text: chart.name, left: "center" },
        tooltip: {},
        xAxis: { type: "category", data: ["A", "B", "C", "D", "E"] },
        yAxis: { type: "value" },
        series: [{ type: "bar", data: chart.data }],
      });

      // 调整图表尺寸
      setTimeout(() => {
        this.modalChartInstance.resize();
      }, 300);
    },
  },
};
</script>

<style scoped>
.chart-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  height: 200px;
}
.chart {
  width: 100%;
  height: 100%;
}
.modal-dialog.modal-xl {
  max-width: 90%;
}
.modal-body {
  padding: 0;
  height: 80vh; /* 高度为视窗高度的 80% */
}
.modal-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
#modal-chart {
  width: 100%;
  height: 100%;
}
</style>
