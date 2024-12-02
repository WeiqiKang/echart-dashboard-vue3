<template>
  <div class="container mt-4">
    <!-- 动态渲染图表及标题 -->
    <div class="row" v-for="(row, rowIndex) in rows" :key="rowIndex">
      <template v-for="(chart, colIndex) in row" :key="colIndex">
        
        <!-- 图表 -->
        <div class="col-3 mb-4">
          <div class="chart-container" @click="openModal(chart)">
            <div ref="charts" class="chart" :id="`chart-${rowIndex}-${colIndex}`"></div>
          </div>
        </div>

      </template>
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
        type: "line",
        xAxis: [], // 日期轴
        series: [] // 曲线数据
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
    this.updateAllChart();

    // 每 5 秒更新一次图表数据
    this.timer = setInterval(() => {
      this.updateAllChart(); // 更新所有图表数据
      if (this.modalChartInstance) {
        this.updateModalChart(); // 更新模态框图表数据
      }
    }, 5000);
  },
  methods: {
    initCharts() {
      this.chartsData.forEach((chart, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const chartDom = document.getElementById(`chart-${row}-${col}`);
        if (!chartDom) return;

        // 获取最后 3 天的数据
        const truncatedXAxis = chart.xAxis.slice(-3); // 截取最后 3 天的日期
        const truncatedSeries = chart.series.map(seriesItem => ({
          ...seriesItem,
          data: seriesItem.data.slice(-3), // 截取最后 3 天的数据
        }));

        const myChart = markRaw(echarts.init(chartDom));
        myChart.setOption({
          title: { text: chart.name, left: "center" },
          tooltip: {
            trigger: 'axis',  // 使用轴触发提示框
            axisPointer: {
              type: 'shadow',  // 使用轴指示器
            },
          },
          xAxis: { 
            type: "category", 
            data: truncatedXAxis 
          },
          yAxis: { type: "value" },
          series: truncatedSeries,
        });
      });
    },

    editChartData(chartId, newData) {
      const chart = this.chartsData.find(chart => chart.id === chartId);
      if (chart) {
        chart.series = newData.series;
        chart.xAxis = newData.xAxis;
        chart.name = newData.name || chart.name;
        chart.type = newData.type || chart.type;
      }
    },

    editMultipleCharts(chartsToUpdate) {
      chartsToUpdate.forEach(({ id, newData }) => {
        this.editChartData(id, newData);
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

      // 更新模态框图表配置
      this.updateModalChart(); // 调用更新逻辑

      modal._element.addEventListener('shown.bs.modal', () => {
        this.modalChartInstance.resize();  // 再次调整图表大小，确保完全填充容器
      });

      // 在模态框关闭时清空数据
      modal._element.addEventListener("hidden.bs.modal", () => {
        if (this.modalChartInstance) {
          this.modalChartInstance.dispose(); // 销毁实例
          this.modalChartInstance = null; // 清空实例引用
        }
        this.selectedChart = {}; // 清空选中的图表数据
      });
      // 显示模态框
      modal.show();
    },
    make_randomInteger(datas, dates, min=0, max=1000, type="bar") {
      const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

      return datas.map((data) => ({
        name: data,
        type: type,
        data: dates.map(() => randomInRange(min, max)), // 使用指定范围生成随机数
      }));
    },
    make_randomDecimal(datas, dates, min=0.0, max=1.0, type="bar") {
      const randomDecimalRange = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

      return datas.map((data) => ({
        name: data,
        type: type,
        data: dates.map(() => randomDecimalRange(min, max)), // 使用指定范围生成随机数
      }));
    },
    updateAllChart() {
      // 更新全部表格
      let dates = ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-07"];

      // 1.1 用户画像
      // 1.1.1 国内用户地域分布
      const provinces = [
        "北京", "天津", "上海", "重庆", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", 
        "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", 
        "广西", "海南", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", 
        "新疆", "香港", "澳门", "台湾"
      ];

      this.updateChart(
        0, 
        dates, 
        this.make_randomInteger(provinces, dates),
        "bar", "1.1.1 国内用户地域分布"
      )

      // 1.1.2 国际用户地域分布
      const countriesAndRegions = [
        "中国", "蒙古", "朝鲜", "韩国", "日本", "菲律宾", "越南", "老挝", "柬埔寨", "缅甸", "泰国", "马来西亚", "文莱", "新加坡", "印度尼西亚", "东帝汶",
        "尼泊尔", "不丹", "孟加拉国", "印度", "巴基斯坦", "斯里兰卡", "马尔代夫", "哈萨克斯坦", "吉尔吉斯斯坦", "塔吉克斯坦", "乌兹别克斯坦", "土库曼斯坦",
        "阿富汗", "伊拉克", "伊朗", "叙利亚", "约旦", "黎巴嫩", "以色列", "巴勒斯坦", "沙特阿拉伯", "巴林", "卡塔尔", "科威特", "阿拉伯联合酋长国", "阿曼", "也门", "格鲁吉亚", "亚美尼亚", "阿塞拜疆", "土耳其", "塞浦路斯",
        "芬兰", "瑞典", "挪威", "冰岛", "丹麦", "法罗群岛（丹）", "爱沙尼亚", "拉脱维亚", "立陶宛", "摩尔多瓦", "白俄罗斯", "俄罗斯", "乌克兰", "波兰", "捷克", "斯洛伐克", "匈牙利", "德国", "奥地利", "瑞士", "列支敦士登",
        "英国", "爱尔兰", "荷兰", "比利时", "卢森堡", "法国", "摩纳哥", "罗马尼亚", "保加利亚", "塞尔维亚", "北马其顿", "斯洛文尼亚", "克罗地亚", "黑山", "波斯尼亚和黑塞哥维那", "阿尔巴尼亚", "希腊", "意大利", "马耳他", "梵蒂冈", "圣马力诺", "西班牙", "葡萄牙", "安道尔", "直布罗陀（英国、西班牙争议，英国实际控制）",
        "埃及", "利比亚", "突尼斯", "阿尔及利亚", "摩洛哥", "亚速尔群岛（葡）", "马德拉群岛（葡）", "加那利群岛（西）", "苏丹", "南苏丹", "埃塞俄比亚", "厄立特里亚", "索马里", "吉布提", "肯尼亚", "坦桑尼亚", "乌干达", "卢旺达", "布隆迪", "塞舌尔", "乍得", "中非", "喀麦隆", "赤道几内亚", "加蓬", "刚果共和国", "刚果民主共和国", "圣多美和普林西比",
        "毛里塔尼亚", "塞内加尔", "冈比亚", "马里", "布基纳法索", "几内亚", "几内亚比绍", "佛得角", "塞拉利昂", "利比里亚", "科特迪瓦", "加纳", "多哥", "贝宁", "尼日尔", "尼日利亚", "西撒哈拉",
        "赞比亚", "安哥拉", "津巴布韦", "马拉维", "莫桑比克", "博茨瓦纳", "纳米比亚", "南非", "斯威士兰", "莱索托", "马达加斯加", "科摩罗", "毛里求斯", "留尼汪岛（法）", "圣赫勒拿岛（英）", "马约特（法）",
        "加拿大", "美国", "墨西哥", "格陵兰（丹）", "圣皮埃尔和密克隆（法）", "百慕大（英）", "危地马拉", "伯利兹", "萨尔瓦多", "洪都拉斯", "尼加拉瓜", "哥斯达黎加", "巴拿马",
        "巴哈马", "古巴", "牙买加", "海地", "多米尼加", "安提瓜和巴布达", "圣基茨和尼维斯", "多米尼克", "圣卢西亚", "圣文森特和格林纳丁斯", "格林纳达", "巴巴多斯", "特立尼达和多巴哥", "波多黎各（美）", "英属维尔京群岛", "美属维尔京群岛",
        "安圭拉（英）", "蒙特塞拉特（英）", "瓜德罗普（法）", "马提尼克（法）", "阿鲁巴（荷）", "荷属圣马丁", "法属圣马丁", "圣巴泰勒米岛（法）", "特克斯和凯科斯群岛（英）", "开曼群岛（英）", "库拉索（荷）",
        "哥伦比亚", "委内瑞拉", "圭亚那", "苏里南", "法属圭亚那", "厄瓜多尔", "秘鲁", "玻利维亚", "智利", "阿根廷", "乌拉圭", "巴拉圭", "马尔维纳斯群岛（阿根廷、英国争议，英国实际控制）",
        "澳大利亚", "新西兰", "帕劳", "密克罗尼西亚联邦", "马绍尔群岛", "基里巴斯", "瑙鲁", "北马里亚纳（美）", "关岛（美）", "巴布亚新几内亚", "所罗门群岛", "瓦努阿图", "斐济群岛", "新喀里多尼亚（法）",
        "图瓦卢", "萨摩亚", "汤加", "库克群岛", "纽埃", "托克劳（新）", "法属波利尼西亚", "瓦利斯和富图纳（法）", "皮特凯恩群岛（英）", "美属萨摩亚"
      ];

      this.updateChart(
        1, 
        dates, 
        this.make_randomInteger(countriesAndRegions, dates),
        "bar", "1.1.2 国际用户地域分布"
      )
      
      // 1.1.3 用户年龄分布
      const ages_splits = ["18岁以下", "18-24岁", "25-34岁", "35-44岁", "45-54岁", "55-64岁", "65岁及以上"];
      this.updateChart(
        2, 
        dates, 
        this.make_randomInteger(ages_splits, dates),
        "bar", "1.1.3 用户年龄分布"
      )
      
      // 1.1.4 用户性别分布
      const sex_splits = ["男", "女"]
      this.updateChart(
        3, 
        dates, 
        this.make_randomInteger(sex_splits, dates),
        "bar", "1.1.4 用户性别分布"
      )
      
      // 1.1.5 用户兴趣分布
      const interest_splits = ["时尚", "美妆", "游戏", "运动", "音乐", "电影", "美食", "科技", "艺术", "其他"]
      this.updateChart(
        4, 
        dates, 
        this.make_randomInteger(interest_splits, dates),
        "bar", "1.1.5 用户兴趣分布"
      )

      // 1.1.6 用户职业分布
      const occupation_splits = ["教师", "医生", "销售", "会计师", "律师", "行政", "设计师", "工程师", "学生", "其他"]
      this.updateChart(
        5, 
        dates, 
        this.make_randomInteger(occupation_splits, dates),
        "bar", "1.1.6 用户职业分布"
      )

      // 1.1.7 用户受教育程度分布
      const education_splits = ["小学及以下", "中学", "专科", "本科", "硕士", "博士及以上"]
      this.updateChart(
        6, 
        dates, 
        this.make_randomInteger(education_splits, dates),
        "bar", "1.1.7 用户受教育程度分布"
      )

      // 1.2 用户影响力
      // 1.2.1 五类用户（意见领袖、普通网民、当事人、官方媒体和网络媒体）影响力
      const user_categories = ["意见领袖", "普通网民", "当事人", "官方媒体和网络媒体"]
      this.updateChart(
        7, 
        dates, 
        this.make_randomDecimal(user_categories, dates, 0.0, 2.0),
        "line", "1.2.1 五类用户影响力"
      )

      // ----------------------------------------第一章：用户 结束------------------------------------------------


      this.initCharts();
    },

    updateChart(id, dates, Y_data, Y_type, name) {
      // 更新单个表格
      
      let xAxis = dates; 

      let series = Y_data;
      
      this.editMultipleCharts([
        {
          id: id, 
          newData: {
            name: name,
            xAxis, // X轴为日期
            series, 
            type: Y_type, // 图表类型
          }
        }
      ]);
    },
    updateModalChart() {
      if (this.selectedChart && this.modalChartInstance) {
        // 获取当前选中的图表数据
        const chartData = this.chartsData.find(chart => chart.id === this.selectedChart.id);

        if (chartData) {
          this.modalChartInstance.setOption({
            title: { text: chartData.name, left: "center" },
            tooltip: {
              trigger: 'item',  // 改为 item，这样每次鼠标悬停在柱状图上时，显示该柱状图的数据
              formatter: function (params) {
                return `${params.seriesName}: ${params.value}`;  // 显示具体数据
              }
            },
            xAxis: { 
              type: "category", 
              data: chartData.xAxis 
            },
            yAxis: { type: "value" },
            series: chartData.series,
            dataZoom: [
                {
                  type: 'inside',  // 内部缩放
                  xAxisIndex: [0],
                  start: 0,
                  end: 100
                },
                {
                  type: 'slider',  // 外部滑块缩放
                  xAxisIndex: [0],
                  start: 0,
                  end: 100
                }
            ],
          });
        }
      }
    }
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
