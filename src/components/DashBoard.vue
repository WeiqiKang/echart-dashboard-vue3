<template>
  <div class="container mt-4">
    <div class="row" v-for="(row, rowIndex) in rows" :key="rowIndex">
      <div class="col-3 mb-4" v-for="(chart, colIndex) in row" :key="colIndex">
        <div class="chart-container" @click="openModal(chart)">
          <div ref="charts" class="chart" :id="`chart-${rowIndex}-${colIndex}`"></div>
        </div>
      </div>
    </div>

    <!-- 模态框 -->
    <div class="modal fade" id="chartModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedChart.name || "Chart Details" }}</h5>
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
        type: "bar",
        xAxis: ["A", "B", "C", "D", "E"],
        series: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
      })),
      selectedChart: {},
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
        if (!chartDom) return;
        const myChart = echarts.init(chartDom);
        myChart.setOption({
          title: { text: chart.name, left: "center" },
          tooltip: {},
          xAxis: { type: "category", data: chart.xAxis },
          yAxis: { type: "value" },
          series: [{ type: chart.type, data: chart.series }],
        });
      });
    },
    openModal(chart) {
      if (!chart || !chart.type || !chart.series) {
        console.error("Invalid chart data:", chart);
        return;
      }

      this.selectedChart = chart;
      const modal = new Modal(document.getElementById("chartModal"));
      modal.show();

      const modalElement = document.getElementById("chartModal");
      modalElement.addEventListener(
        "shown.bs.modal",
        () => {
          if (!this.modalChartInstance) {
            const modalChartDom = document.getElementById("modal-chart");
            this.modalChartInstance = echarts.init(modalChartDom);
          }

          this.modalChartInstance.setOption({
            title: { text: this.selectedChart.name, left: "center" },
            tooltip: {},
            xAxis: { type: "category", data: this.selectedChart.xAxis },
            yAxis: { type: "value" },
            series: [
              {
                type: this.selectedChart.type,
                data: this.selectedChart.series,
              },
            ],
          });

          setTimeout(() => {
            this.modalChartInstance.resize();
          }, 300);
        },
        { once: true }
      );
    },
  },
};
</script>

<style scoped>
.chart-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  height: 25vh; /* 每个图表高度为视窗高度的 25% */
  width: 100%;  /* 宽度占满父级容器 */
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
  height: 80vh;
}
.modal-chart-container {
  width: 100%;
  height: 100%;
}
#modal-chart {
  width: 100%;
  height: 100%;
}
</style>
