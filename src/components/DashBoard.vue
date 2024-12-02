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
import { markRaw } from "vue";

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
        const myChart = markRaw(echarts.init(chartDom));
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
      this.selectedChart = chart; // 更新当前选中图表数据
      const modal = new Modal(document.getElementById("chartModal"));

      // 初始化或更新模态框图表
      const modalChartDom = document.getElementById("modal-chart");
      if (!this.modalChartInstance) {
        this.modalChartInstance = markRaw(echarts.init(modalChartDom));
      }
      
      // 更新图表配置
      this.modalChartInstance.setOption({
        title: { text: chart.name, left: "center" },
        tooltip: {},
        xAxis: { type: "category", data: chart.xAxis },
        yAxis: { type: "value" },
        series: [
          {
            type: chart.type,
            data: chart.series,
          },
        ],
      });

      
      
      // // 等待模态框显示后，再调整图表大小
      // this.$nextTick(() => {
      //   this.modalChartInstance.resize();  // 在 DOM 更新后重新调整图表大小
      // });

      // 也可以绑定模态框打开后的事件来调整图表大小
      modal._element.addEventListener('shown.bs.modal', () => {
        this.modalChartInstance.resize();  // 再次调整图表大小，确保完全填充容器
      });
      // 显示模态框
      modal.show();
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
