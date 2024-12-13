<template>
	<div class="container mt-5">
		<div class="alert custom-alert alert-dismissible fade show" role="alert">
			<strong>🎉 Welcome!</strong> 友情提示：单击图表可以全屏查看
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>
	</div>
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
		<div v-if="showNotification" class="notification">
			数据已更新！
			<button class="close-btn" @click="disableNotification">不再提示</button>
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
			chinaMapData: {
				data: []
			},
			worldMapData: {
				data: []
			},
			selectedChart: {},
			modalChartInstance: null,
			users: ["Alice", "Bob", "Cindy", "Dawid"],  // 用于“最xxx用户相关”
			keywords: ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"], // 用于最热搜索关键词
			events: ["event1", "event2", "event3", "event4", "event5"],
			platform: ["抖音", "快手", "b站", "微博", "推特"],
			dates: this.generateDates(20, 10),
			showNotification: false, // 是否显示提示窗口
			notificationDisabled: false, // 是否禁用提示
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
		this.loadMapData()
			.then(() => {
				// this.initCharts();
				this.updateAllChart();
			})
			.catch((err) => {
				console.error("地图数据加载失败：", err);
			});


		// 每 20 秒更新一次图表数据
		this.timer = setInterval(() => {
			this.updateAllChart(); // 更新所有图表数据
			if (this.modalChartInstance) {
				this.updateModalChart(); // 更新模态框图表数据
			}
		}, 1000000);
	},
	methods: {
		generateDates(numDates, dayInterval) {
			const dates = [];
			const currentDate = new Date();

			for (let i = 0; i < numDates; i++) {
				// 生成每个日期，间隔为 dayInterval 天
				const newDate = new Date(currentDate.getTime() + i * dayInterval * 24 * 60 * 60 * 1000);
				// 格式化为 yyyy-MM-dd
				const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(newDate.getDate()).padStart(2, "0")}`;
				dates.push(formattedDate);
			}

			return dates;
		},
		async loadMapData() {
			// 加载中国地图
			const chinaGeoJson = await fetch(`geojson/china.json`).then(res => res.json());
			echarts.registerMap("china", chinaGeoJson);
			// 加载世界地图
			const wordGeoJson = await fetch(`geojson/world.json`).then(res => res.json());
			echarts.registerMap("world", wordGeoJson);
		},
		triggerNotification() {
			if (this.notificationDisabled) return; // 如果已禁用提示，则不显示
			this.showNotification = true;
			setTimeout(() => {
				this.showNotification = false;
			}, 4000); // 4秒后隐藏提示
		},
		disableNotification() {
			this.notificationDisabled = true; // 禁用提示
			this.showNotification = false; // 隐藏当前提示
		},
		initCharts() {
			this.chartsData.forEach((chart, index) => {
				const row = Math.floor(index / 4);
				const col = index % 4;
				const chartDom = document.getElementById(`chart-${row}-${col}`);
				if (!chartDom) return;
				const myChart = markRaw(echarts.init(chartDom));
				if (index === 0) {
					// 针对1.1.1 国内用户分布的小图特殊处理
					myChart.setOption({
						title: { text: chart.name, left: "center" },
						tooltip: {
							trigger: "item",
							formatter: "{b}: {c}",
						},
						visualMap: {
							min: 0,
							max: 1000,
							left: "left",
							top: "bottom",
							text: ["高", "低"],
							inRange: {
								color: ["#e0f7fa", "#0288d1", "#01579b"],
							},
							show: false,
						},
						series: [
							{
								type: "map",
								map: "china",
								data: this.chinaMapData.data[0], // 小图仅显示第一天的数据
							},
						],
					});
				}
				else if (index === 1) {
					// 针对1.1.2 国际用户分布的小图特殊处理
					myChart.setOption({
						title: { text: chart.name, left: "center" },
						tooltip: {
							trigger: "item",
							formatter: "{b}: {c}",
						},
						visualMap: {
							min: 0,
							max: 1000,
							left: "left",
							top: "bottom",
							text: ["高", "低"],
							inRange: {
								color: ["#e0f7fa", "#0288d1", "#01579b"],
							},
							show: false,
						},
						series: [
							{
								type: "map",
								map: "world",
								data: this.worldMapData.data[0], // 小图仅显示第一天的数据
							},
						],
					});
				}
				else if (index === 26) {

					const firstDayPositiveValue = chart.series[0].data[0]; // 第一天正面数据
					const firstDayNegativeValue = chart.series[1].data[0]; // 第一天负面数据
					const firstDayNeutralValue = chart.series[2].data[0]; // 第一天中性数据
					// const totalFirstDay = firstDayPositiveValue + firstDayNegativeValue + firstDayNeutralValue; // 第一天总和

					// 构造饼图数据
					const firstDayPieChartData = [
						{ name: "正面", value: firstDayPositiveValue },
						{ name: "负面", value: firstDayNegativeValue },
						{ name: "中性", value: firstDayNeutralValue },
					];

					// 使用 setOption 更新小图
					myChart.setOption({
						title: {
							text: "2.5.1 信息情绪极性分布",
							left: "center",
						},
						tooltip: {
							trigger: "item",
							formatter: "{b}: {c} ({d}%)",
						},
						legend: {
							orient: "horizontal",
							bottom: "bottom",
							data: ["正面", "负面", "中性"],
						},
						series: [
							{
								name: "情绪分布",
								type: "pie",
								radius: "50%",
								data: firstDayPieChartData,
								label: {
									formatter: "{b}: {c} ({d}%)",
								},
								emphasis: {
									label: {
										show: true,
										fontSize: 14,
										fontWeight: "bold",
									},
								},
							},
						],
					});
				} else {
					// 获取最后 3 天的数据
					const truncatedXAxis = chart.xAxis.slice(-3); // 截取最后 3 天的日期
					let truncatedSeries = null;
					if (chart.series.type === "line") {
						truncatedSeries = {
							type: chart.series.type,
							data: chart.series.data.slice(-3)
						}
					} else {
						truncatedSeries = chart.series.map(seriesItem => ({
							...seriesItem,
							data: seriesItem.data.slice(-3), // 截取最后 3 天的数据
						}));
					}


					myChart.setOption({
						title: { text: chart.name, left: "center" },
						tooltip: {
							trigger: 'item',  // 使用轴触发提示框
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
				}

			});
		},

		editChartData(chartId, newData) {
			const chart = this.chartsData.find(chart => chart.id === chartId);
			if (chart) {
				chart.series = newData.series;
				chart.xAxis = newData.xAxis;
				chart.name = newData.name;
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
		make_randomInteger(dates, min = 0, max = 1000, type = "bar", asc = false) {
			const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

			if (asc) {
				return {
					type: type,
					data: dates.reduce((acc, _, index) => {
						if (index === 0) {
							// 初始化第一个值
							acc.push(randomInRange(min, max));
						} else {
							// 生成递增的随机值，确保不超过 max
							const nextValue = acc[index - 1] + randomInRange(1, Math.max(1, max - acc[index - 1]));
							acc.push(Math.min(nextValue, max)); // 确保不超过 max
						}
						return acc;
					}, []),
				};
			}
			return {
				type: type,
				data: dates.map(() => randomInRange(min, max)), // 使用指定范围生成随机数
			};
		},
		make_randomDecimal(dates, min = 0.0, max = 1.0, type = "bar") {
			const randomDecimalRange = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

			return {
				type: type,
				data: dates.map(() => randomDecimalRange(min, max)), // 使用指定范围生成随机数
			};
		},
		make_randomIntegerByDates(datas, dates, min = 0, max = 1000, type = "bar", asc = false) {
			const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

			if (asc) {
				return datas.map((data) => {
					// 生成随机数数组
					let randomValues = dates.map(() => randomInRange(min, max));

					// 根据 asc 参数决定是否排序
					randomValues.sort((a, b) => a - b); // 单调递增
					return {
						name: data,
						type: type,
						data: randomValues,
					};
				});
			}

			return datas.map((data) => ({
				name: data,
				type: type,
				data: dates.map(() => randomInRange(min, max)), // 使用指定范围生成随机数
			}));
		},
		make_randomDecimalByDates(datas, dates, min = 0.0, max = 1.0, type = "bar", normalize = false) {
			const randomDecimalRange = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

			if (normalize === true) {
				if (!this._normalizedValuesByDate) {
					this._normalizedValuesByDate = [];
				}
				return datas.map((data, dataIndex) => ({
					name: data,
					type: type,
					data: dates.map((_, dateIndex) => {
						// 生成一组随机数，长度为 datas 的长度
						if (!this._normalizedValuesByDate[dateIndex]) {
							// 第一次生成归一化的随机数
							const rawValues = datas.map(() => Math.random());
							const total = rawValues.reduce((sum, value) => sum + value, 0);
							this._normalizedValuesByDate[dateIndex] = rawValues.map((value) => value / total); // 归一化
						}
						// 返回归一化值
						return parseFloat(this._normalizedValuesByDate[dateIndex][dataIndex].toFixed(2));
					}),
				}));
			} else {
				return datas.map((data) => ({
					name: data,
					type: type,
					data: dates.map(() => randomDecimalRange(min, max)), // 使用指定范围生成随机数
				}));
			}

		},
		// 正态分布生成函数（Box-Muller变换）
		generateNormalRandom(mean, stddev) {
			let u = 0,
				v = 0;
			while (u === 0) u = Math.random(); // 避免 u 为 0
			while (v === 0) v = Math.random(); // 避免 v 为 0
			const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
			return z * stddev + mean; // 转换为指定均值和标准差的正态分布
		},
		updateAllChart() {
			this.triggerNotification(); // 数据更新时，触发弹窗提示
			// 更新全部表格

			// 1.1 用户画像
			// 1.1.1 国内用户地域分布

			const provinces = [
				"北京", "天津", "上海", "重庆", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江",
				"江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东",
				"广西", "海南", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏",
				"新疆", "香港", "澳门", "台湾"
			];

			this.chinaMapData.data = this.dates.map((date, dayIndex) => {
				// 如果是第一天，初始化各省份的值为正态分布随机数
				if (dayIndex === 0) {
					this.chinaMapData.currentValues = provinces.reduce((acc, province) => {
						// 生成正态分布随机数，均值为500，标准差为100
						acc[province] = Math.max(this.generateNormalRandom(500, 500), 0);
						return acc;
					}, {});
				}

				return provinces.map((province) => {
					// 每天基于前一天的值递增，递增范围为10~50的随机值
					const increment = 10 + Math.random() * 40;
					this.chinaMapData.currentValues[province] += increment;

					return {
						name: province,
						value: Math.round(this.chinaMapData.currentValues[province]), // 确保取整
					};
				});
			});

			// 更新小图显示第一天的数据
			this.editChartData(0, {
				name: "1.1.1 国内用户地域分布",
				xAxis: [],
				series: [
					{
						type: "map",
						map: "china",
						data: this.chinaMapData.data[0], // 只取第一天的数据
					},
				],
			});

			// 1.1.2 国际用户地域分布
			const countriesAndRegions = [
				"津巴布韦", "赞比亚", "也门", "越南", "委内瑞拉", "梵蒂冈", "瓦努阿图", "乌兹别克斯坦", "乌拉圭", "密克罗尼西亚",
				"马绍尔群岛", "北马里亚纳群岛", "美属维尔京群岛", "关岛", "美属萨摩亚", "波多黎各", "美国", "南乔治亚和南桑威奇群岛",
				"英属印度洋领地", "圣赫勒拿", "皮特凯恩群岛", "安圭拉", "马尔维纳斯群岛（福克兰）", "开曼群岛", "百慕大",
				"英属维尔京群岛", "特克斯和凯科斯群岛", "蒙特塞拉特", "泽西岛", "根西岛", "马恩岛", "英国", "阿联酋", "乌克兰",
				"乌干达", "土库曼斯坦", "土耳其", "突尼斯", "特立尼达和多巴哥", "汤加", "多哥", "东帝汶", "泰国", "坦桑尼亚",
				"塔吉克斯坦", "叙利亚", "瑞士", "瑞典", "斯威士兰", "苏里南", "南苏丹", "苏丹", "斯里兰卡", "西班牙", "韩国",
				"南非", "索马里", "索马里兰", "所罗门群岛", "斯洛伐克", "斯洛文尼亚", "新加坡", "塞拉利昂", "塞舌尔", "塞尔维亚",
				"塞内加尔", "沙特阿拉伯", "圣多美和普林西比", "圣马力诺", "萨摩亚", "圣文森特和格林纳丁斯", "圣卢西亚", "圣基茨和尼维斯",
				"卢旺达", "俄罗斯", "罗马尼亚", "卡塔尔", "葡萄牙", "波兰", "菲律宾", "秘鲁", "巴拉圭", "巴布亚新几内亚", "巴拿马",
				"帕劳", "巴基斯坦", "阿曼", "挪威", "朝鲜", "尼日利亚", "尼日尔", "尼加拉瓜", "新西兰", "纽埃", "库克群岛", "荷兰",
				"阿鲁巴", "库拉索", "尼泊尔", "瑙鲁", "纳米比亚", "莫桑比克", "摩洛哥", "西撒哈拉", "黑山", "蒙古", "摩尔多瓦",
				"摩纳哥", "墨西哥", "毛里求斯", "毛里塔尼亚", "马耳他", "马里", "马尔代夫", "马来西亚", "马拉维", "马达加斯加",
				"北马其顿", "卢森堡", "立陶宛", "列支敦士登", "利比亚", "利比里亚", "莱索托", "黎巴嫩", "拉脱维亚", "老挝", "吉尔吉斯斯坦",
				"科威特", "基里巴斯", "肯尼亚", "哈萨克斯坦", "约旦", "日本", "牙买加", "意大利", "以色列", "巴勒斯坦", "爱尔兰", "伊拉克",
				"伊朗", "印度尼西亚", "印度", "冰岛", "匈牙利", "洪都拉斯", "海地", "圭亚那", "几内亚比绍", "几内亚", "危地马拉",
				"格林纳达", "希腊", "加纳", "德国", "格鲁吉亚", "冈比亚", "加蓬", "法国", "圣皮埃尔和密克隆群岛", "瓦利斯和富图纳群岛",
				"法属圣马丁", "圣巴泰勒米", "法属波利尼西亚", "新喀里多尼亚", "法属南部和南极领地", "奥兰群岛", "芬兰", "斐济", "埃塞俄比亚",
				"爱沙尼亚", "厄立特里亚", "赤道几内亚", "萨尔瓦多", "埃及", "厄瓜多尔", "多米尼加", "多米尼克", "美国本土外小岛屿", "吉布提",
				"格陵兰", "法罗群岛", "丹麦", "捷克", "北塞浦路斯", "塞浦路斯", "古巴", "克罗地亚", "科特迪瓦", "哥斯达黎加", "刚果（金）",
				"刚果（布）", "科摩罗", "哥伦比亚", "中国", "智利", "乍得", "中非", "佛得角", "加拿大", "喀麦隆", "柬埔寨", "缅甸",
				"布隆迪", "布基纳法索", "保加利亚", "文莱", "巴西", "博茨瓦纳", "波黑", "玻利维亚", "不丹", "贝宁", "伯利兹", "比利时",
				"白俄罗斯", "巴巴多斯", "孟加拉国", "巴林", "巴哈马", "阿塞拜疆", "奥地利", "澳大利亚", "圣诞岛", "赫德岛和麦克唐纳群岛",
				"诺福克岛", "阿什莫尔和卡捷群岛", "亚美尼亚", "阿根廷", "安提瓜和巴布达", "安哥拉", "安道尔", "阿尔及利亚", "阿尔巴尼亚",
				"阿富汗", "锡亚琴冰川", "南极洲", "荷属圣马丁", "图瓦卢"
			];

			this.worldMapData.data = this.dates.map((date, dayIndex) => {
				// 如果是第一天，初始化各省份的值为正态分布随机数
				if (dayIndex === 0) {
					this.worldMapData.currentValues = countriesAndRegions.reduce((acc, country) => {
						// 生成正态分布随机数，均值为500，标准差为100
						acc[country] = Math.max(this.generateNormalRandom(30000, 30000), 0);
						return acc;
					}, {});
				}

				return countriesAndRegions.map((country) => {
					// 每天基于前一天的值递增，递增范围为10~50的随机值
					const increment = 10 + Math.random() * 40;
					this.worldMapData.currentValues[country] += increment;

					return {
						name: country,
						value: Math.round(this.worldMapData.currentValues[country]), // 确保取整
					};
				});
			});

			// 更新小图显示第一天的数据
			this.editChartData(1, {
				name: "1.1.2 国际用户地域分布",
				xAxis: [],
				series: [
					{
						type: "map",
						map: "world",
						data: this.worldMapData.data[0], // 只取第一天的数据
					},
				],
			});

			// 1.1.3 用户年龄分布
			const ages_splits = ["18岁以下", "18-24岁", "25-34岁", "35-44岁", "45-54岁", "55-64岁", "65岁及以上"];
			this.updateChart(
				2,
				this.dates,
				this.make_randomIntegerByDates(ages_splits, this.dates),
				"1.1.3 用户年龄分布"
			)

			// 1.1.4 用户性别分布
			const sex_splits = ["男", "女"]
			this.updateChart(
				3,
				this.dates,
				this.make_randomIntegerByDates(sex_splits, this.dates),
				"1.1.4 用户性别分布"
			)

			// 1.1.5 用户兴趣分布
			const interest_splits = ["时尚", "美妆", "游戏", "运动", "音乐", "电影", "美食", "科技", "艺术", "其他"]
			this.updateChart(
				4,
				this.dates,
				this.make_randomIntegerByDates(interest_splits, this.dates),
				"1.1.5 用户兴趣分布"
			)

			// 1.1.6 用户职业分布
			const occupation_splits = ["教师", "医生", "销售", "会计师", "律师", "行政", "设计师", "工程师", "学生", "其他"]
			this.updateChart(
				5,
				this.dates,
				this.make_randomIntegerByDates(occupation_splits, this.dates),
				"1.1.6 用户职业分布"
			)

			// 1.1.7 用户受教育程度分布
			const education_splits = ["小学及以下", "中学", "专科", "本科", "硕士", "博士及以上"]
			this.updateChart(
				6,
				this.dates,
				this.make_randomIntegerByDates(education_splits, this.dates),
				"1.1.7 用户受教育程度分布"
			)

			// 1.2 用户影响力
			// 1.2.1 五类用户（意见领袖、普通网民、当事人、官方媒体和网络媒体）影响力
			const user_categories = ["意见领袖", "普通网民", "当事人", "官方媒体", "网络媒体"]
			this.updateChart(
				7,
				this.dates,
				this.make_randomDecimalByDates(user_categories, this.dates, 0.0, 2.0),
				"1.2.1 五类用户影响力"
			)

			// 1.2.2 五类用户（意见领袖、普通网民、当事人、官方媒体和网络媒体）活跃度
			this.updateChart(
				8,
				this.dates,
				this.make_randomDecimalByDates(user_categories, this.dates, 0.0, 2.0),
				"1.2.2 五类用户活跃度"
			)

			// 1.2.3 最具影响力用户
			// 创建随机用户
			const createRandomUser = () => {
				const randomName = `User_${Math.random().toString(36).substring(2, 8)}`; // 随机用户名
				return randomName;
			};

			// 用户上限100
			if (this.users.length < 100) {
				this.users.push(createRandomUser());
			}

			const randomData_1_2_3 = this.make_randomDecimalByDates(this.users, this.dates, 0.0, 1.0);

			// 计算每天TOP 5用户
			const calculateTopInfluencers = (randomData_1_2_3, dates, num_slice) => {
				return dates.map((date, dateIndex) => {
					const userInfluence = randomData_1_2_3.map(userSeries => ({
						name: userSeries.name,
						value: userSeries.data[dateIndex],
					}));

					// 按 value 从大到小排序
					return userInfluence.sort((a, b) => a.value - b.value).slice(0, num_slice);
				});
			};

			// 计算TOP 5用户
			// 实际对接后端时，后端构造这个数据结构就行了
			const topInfluencers_1_2_3 = calculateTopInfluencers(randomData_1_2_3, this.dates, 5);

			// 将数据映射为 ECharts 的 series 格式
			const seriesData_1_2_3 = topInfluencers_1_2_3.flatMap((dayInfluencers, dateIndex) =>
				dayInfluencers.map((user) => ({
					name: user.name, // 用户名
					type: "bar", // 柱状图
					stack: "total", // 同一堆叠
					data: this.dates.map((_, i) => (i === dateIndex ? user.value : "")), // 仅对应日期显示数据
				}))
			);

			this.updateChart(
				9,
				this.dates,
				seriesData_1_2_3,
				"1.2.3 最具影响力用户（TOP 5）"
			)

			// 1.2.4 最具正能量用户
			const randomData_1_2_4 = this.make_randomDecimalByDates(this.users, this.dates, 0.0, 1.0);
			const topInfluencers_1_2_4 = calculateTopInfluencers(randomData_1_2_4, this.dates, 5);
			const seriesData_1_2_4 = topInfluencers_1_2_4.flatMap((dayInfluencers, dateIndex) =>
				dayInfluencers.map((user) => ({
					name: user.name, // 用户名
					type: "bar", // 柱状图
					stack: "total", // 同一堆叠
					data: this.dates.map((_, i) => (i === dateIndex ? user.value : "")), // 仅对应日期显示数据
				}))
			);
			this.updateChart(
				10,
				this.dates,
				seriesData_1_2_4,
				"1.2.4 最具正能量用户（TOP 5）"
			)

			// 1.2.5 最具负能量用户
			const randomData_1_2_5 = this.make_randomDecimalByDates(this.users, this.dates, 0.0, 1.0);
			const topInfluencers_1_2_5 = calculateTopInfluencers(randomData_1_2_5, this.dates, 5);
			const seriesData_1_2_5 = topInfluencers_1_2_5.flatMap((dayInfluencers, dateIndex) =>
				dayInfluencers.map((user) => ({
					name: user.name, // 用户名
					type: "bar", // 柱状图
					stack: "total", // 同一堆叠
					data: this.dates.map((_, i) => (i === dateIndex ? user.value : "")), // 仅对应日期显示数据
				}))
			);
			this.updateChart(
				11,
				this.dates,
				seriesData_1_2_5,
				"1.2.5 最具负能量用户（TOP 5）"
			)

			// 1.3 用户传播状态
			// 1.3.1 潜在受众数量

			this.updateChart(
				12,
				this.dates,
				this.make_randomInteger(this.dates, 200, 500, "line"),
				"1.3.1 潜在受众数量"
			)

			// 1.3.2 知情者数量

			this.updateChart(
				13,
				this.dates,
				this.make_randomInteger(this.dates, 200, 500, "line"),
				"1.3.2 知情者数量"
			)

			// 1.3.3 传播者数量

			this.updateChart(
				14,
				this.dates,
				this.make_randomInteger(this.dates, 200, 500, "line"),
				"1.3.3 传播者数量"
			)

			// 1.3.4 停滞者数量
			this.updateChart(
				15,
				this.dates,
				this.make_randomInteger(this.dates, 200, 500, "line"),
				"1.3.4 停滞者数量"
			)
			// ----------------------------------------第一章：用户 结束------------------------------------------------

			// 2 信息
			// 2.1 信息影响力
			// 2.1.1 热度指数
			this.updateChart(
				16,
				this.dates,
				this.make_randomDecimal(this.dates, 1.0, 2.0, "line"),
				"2.1.1 热度指数"
			)

			// 2.1.2 争议性指数
			this.updateChart(
				17,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 1.0, "line"),
				"2.1.2 争议性指数"
			)

			// 2.1.3 影响力指数
			this.updateChart(
				18,
				this.dates,
				this.make_randomDecimal(this.dates, 1.0, 2.0, "line"),
				"2.1.3 影响力指数"
			)

			// 2.1.4 参与性指数
			this.updateChart(
				19,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 1.0, "line"),
				"2.1.4 参与性指数"
			)

			// 2.2 信息传播强度
			// 2.2.1 传播速度
			this.updateChart(
				20,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 100.0, "line"),
				"2.2.1 传播速度"
			)

			// 2.2.2 覆盖范围
			this.updateChart(
				21,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 20.0, "line"),
				"2.2.2 覆盖范围"
			)

			// 2.2.3 内容载体多样性
			this.updateChart(
				22,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 1.0, "line"),
				"2.2.3 内容载体多样性"
			)

			// 2.2.4 相关热搜关键词
			const createRandomKeyword = () => {
				const randomKeyword = `keyword_${Math.random().toString(36).substring(2, 8)}`; // 随机关键词
				return randomKeyword;
			};

			// 关键词上限100
			if (this.keywords.length < 100) {
				this.keywords.push(createRandomKeyword());
			}

			const randomData_2_2_4 = this.make_randomIntegerByDates(this.keywords, this.dates, 200.0, 500.0);
			const topKeywords_2_2_4 = calculateTopInfluencers(randomData_2_2_4, this.dates, 5);

			const seriesData_2_2_4 = topKeywords_2_2_4.flatMap((dayInfluencers, dateIndex) =>
				dayInfluencers.map((user) => ({
					name: user.name, // 用户名
					type: "bar", // 柱状图
					stack: "total", // 同一堆叠
					data: this.dates.map((_, i) => (i === dateIndex ? user.value : "")), // 仅对应日期显示数据
				}))
			);

			this.updateChart(
				23,
				this.dates,
				seriesData_2_2_4,
				"2.2.4 相关热搜关键词（TOP 5）"
			)

			// 2.3.1 最强关联信息
			const createRandomEvent = () => {
				const randomEvent = `event_${Math.random().toString(36).substring(2, 8)}`; // 随机事件名
				return randomEvent;
			};

			if (this.events.length < 100) {
				this.events.push(createRandomEvent());
			}

			const randomData_2_3_1 = this.make_randomDecimalByDates(this.events, this.dates, 0.1, 1.0);
			const topEvents_2_3_1 = calculateTopInfluencers(randomData_2_3_1, this.dates, 1);

			const seriesData_2_3_1 = topEvents_2_3_1.flatMap((dayInfluencers, dateIndex) =>
				dayInfluencers.map((user) => ({
					name: user.name, // 用户名
					type: "bar", // 柱状图
					stack: "total", // 同一堆叠
					data: this.dates.map((_, i) => (i === dateIndex ? user.value : "")), // 仅对应日期显示数据
				}))
			);

			this.updateChart(
				24,
				this.dates,
				seriesData_2_3_1,
				"2.3.1 最强关联信息（TOP 1）"
			)

			// 2.4.1 可信性指数
			this.updateChart(
				25,
				this.dates,
				this.make_randomDecimal(this.dates, 1.0, 20.0, "line"),
				"2.4.1 可信性指数"
			)

			// 2.5.1 信息情绪极性分布
			const emotions_splits = ["正面", "负面", "中性"];

			this.updateChart(
				26,
				this.dates,
				this.make_randomDecimalByDates(emotions_splits, this.dates, 0.0, 1.0, "pie", true),
				"2.5.1 信息情绪极性分布"
			)

			// 2.6.1 地理聚集指数
			this.updateChart(
				27,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 1.0, "line"),
				"2.6.1 地理聚集指数"
			)

			// 2.6.2 人群聚集指数
			this.updateChart(
				28,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 1.0, "line"),
				"2.6.2 人群聚集指数"
			)

			// 2.6.3 平台聚集指数
			this.updateChart(
				29,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 1.0, "line"),
				"2.6.3 平台聚集指数"
			)

			// 2.7.1 敏感性指数
			this.updateChart(
				30,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 2.0, "line"),
				"2.7.1 敏感性指数"
			)

			// 2.7.2 敏感话题数量
			this.updateChart(
				31,
				this.dates,
				this.make_randomInteger(this.dates, 3, 7, "line"),
				"2.7.2 敏感话题数量"
			)
			// ----------------------------------------第二章：信息 结束------------------------------------------------

			// 3 平台
			// 3.1 平台丰富度
			// 3.1.1 平台类型多样性
			this.updateChart(
				32,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 1.0, "line"),
				"3.1.1 平台类型多样性"
			)

			// 3.1.2 跨平台扩展潜力
			this.updateChart(
				33,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 3.0, "line"),
				"3.1.2 跨平台扩展潜力"
			)

			// 3.2 平台影响力
			// 3.2.1 最具热度平台
			const createRandomPlatform = () => {
				const randomPlatform = `platform_${Math.random().toString(36).substring(2, 8)}`; // 随机关键词
				return randomPlatform;
			};

			// 平台个数上限7
			if (this.platform.length < 7) {
				this.platform.push(createRandomPlatform());
			}

			const randomData_3_2_1 = this.make_randomIntegerByDates(this.platform, this.dates, 100, 300);
			const topPlatform_3_2_1 = calculateTopInfluencers(randomData_3_2_1, this.dates, 5);
			const seriesData_3_2_1 = topPlatform_3_2_1.flatMap((dayInfluencers, dateIndex) =>
				dayInfluencers.map((user) => ({
					name: user.name, // 用户名
					type: "bar", // 柱状图
					stack: "total", // 同一堆叠
					data: this.dates.map((_, i) => (i === dateIndex ? user.value : "")), // 仅对应日期显示数据
				}))
			);

			this.updateChart(
				34,
				this.dates,
				seriesData_3_2_1,
				"3.2.1 最具热度平台"
			)

			// 3.3.1 跨平台传播速度
			this.updateChart(
				35,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 1.0, "line"),
				"3.3.1 跨平台传播速度"
			)

			// 3.3.2 跨平台情绪协调性
			this.updateChart(
				36,
				this.dates,
				this.make_randomDecimal(this.dates, 0.0, 1.0, "line"),
				"3.3.2 跨平台情绪协调性"
			)

			// 3.3.4 跨平台争议性分布
			this.updateChart(
				37,
				this.dates,
				this.make_randomDecimalByDates(this.platform, this.dates, 0.0, 1.0, "bar"),
				"3.3.4 跨平台争议性分布"
			)

			// 3.4.2 平台响应用户数量
			this.updateChart(
				38,
				this.dates,
				this.make_randomIntegerByDates(this.platform, this.dates, 0, 50000, "bar", true),
				"3.4.2 平台响应用户数量"
			)

			// 3.4.3 平台响应互动数量
			this.updateChart(
				39,
				this.dates,
				this.make_randomIntegerByDates(this.platform, this.dates, 10000, 500000, "bar", true),
				"3.4.3 平台响应互动数量"
			)
			// ----------------------------------------全部图表设置完毕--------------------------------------
			this.initCharts();
		},

		updateChart(id, dates, Y_data, name) {
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
					}
				}
			]);
		},
		updateModalChart() {
			if (this.selectedChart && this.modalChartInstance) {
				// 获取当前选中的图表数据
				const chartData = this.chartsData.find(chart => chart.id === this.selectedChart.id);

				if (chartData) {
					if (this.selectedChart.id === 0) {
						const timelineOptions = this.chinaMapData.data.map((data) => ({
							series: [
								{
									type: "map",
									map: "china",
									label: {
										show: true, // 显示标签
										formatter: "{b}\n{c}", // 标签格式为 地区\n数值
										fontSize: 13,
									},
									roam: true, // 启用鼠标滚轮缩放和拖拽
									emphasis: {
										label: {
											show: true, // 鼠标悬停显示详细信息
											formatter: "{b}\n{c}", // 鼠标悬停时显示数值
											textStyle: {
												color: "#000", // 悬停文本颜色
												fontWeight: "bold",
											},
										},
									},
									data: data.map((item) => ({
										...item,
										label: item.name === "河北" ? { offset: [-15, 15] } :
											item.name === "甘肃" ? { offset: [20, -15] } : undefined,
									})),
								},
							],
						}));

						this.modalChartInstance.setOption({
							baseOption: {
								title: { text: "1.1.1 国内用户地域分布", left: "center" },
								timeline: {
									axisType: "category",
									autoPlay: true,
									playInterval: 3000,
									data: this.dates,
									label: { formatter: "{value}" },
								},
								tooltip: {
									trigger: "item",
									formatter: "{b}: {c}",
								},
								visualMap: {
									min: 0,
									max: 1000,
									left: "left",
									top: "bottom",
									text: ["高", "低"],
									inRange: {
										color: ["#e1f5fe", "#b3e5fc", "#81d4fa", "#4fc3f7", "#29b6f6", "#0288d1", "#01579b",],
									},
									show: true,
								},
								series: [],
							},
							options: timelineOptions,
						});

						// 添加鼠标悬停事件监听，仅对第 0 个图表
						this.modalChartInstance.off("mouseover"); // 确保不会重复注册监听器
						this.modalChartInstance.off("mouseout");
						this.modalChartInstance.on("mouseover", (params) => {
							if (params.componentType === "series" && params.data) {
								this.showProvinceTimeSeries(params.data.name);
							}
						});
						this.modalChartInstance.on("mouseout", () => {
							this.hideProvinceTooltip();
						});
					} else if (this.selectedChart.id === 1) {
						const timelineOptions = this.worldMapData.data.map((data) => ({
							series: [
								{
									type: "map",
									map: "world",
									label: {
										show: false, // 显示标签
										formatter: "{b}\n{c}", // 标签格式为 地区\n数值
										fontSize: 13,
									},
									roam: true, // 启用鼠标滚轮缩放和拖拽
									emphasis: {
										label: {
											show: true, // 鼠标悬停显示详细信息
											formatter: "{b}\n{c}", // 鼠标悬停时显示数值
											textStyle: {
												color: "#000", // 悬停文本颜色
												fontWeight: "bold",
											},
										},
									},
									data: data
								},
							],
						}));

						this.modalChartInstance.setOption({
							baseOption: {
								title: { text: "1.1.2 国际用户地域分布", left: "center" },
								timeline: {
									axisType: "category",
									autoPlay: true,
									playInterval: 5000,
									data: this.dates,
									label: { formatter: "{value}" },
								},
								tooltip: {
									trigger: "item",
									formatter: "{b}: {c}",
								},
								visualMap: {
									min: 0,
									max: 1000,
									left: "left",
									top: "bottom",
									text: ["高", "低"],
									inRange: {
										color: ["#e1f5fe", "#b3e5fc", "#81d4fa", "#4fc3f7", "#29b6f6", "#0288d1", "#01579b",],
									},
									show: true,
								},
								series: [],
							},
							options: timelineOptions,
						});

						// 添加鼠标悬停事件监听，对第 1 个图表
						this.modalChartInstance.off("mouseover"); // 确保不会重复注册监听器
						this.modalChartInstance.off("mouseout");
						this.modalChartInstance.on("mouseover", (params) => {
							if (params.componentType === "series" && params.data) {
								this.showCountryTimeSeries(params.data.name);
							}
						});
						this.modalChartInstance.on("mouseout", () => {
							this.hideCountryTooltip();
						});
					} else if (this.selectedChart.id === 26) {
						this.modalChartInstance.off("mouseover");
						this.modalChartInstance.off("mouseout");
						// 将数据转换为饼图所需格式
						const pieSeries = this.dates.map((date, index) => {
							const positiveValue = chartData.series[0].data[index]; // 正面数据
							const negativeValue = chartData.series[1].data[index]; // 负面数据
							const neutralValue = chartData.series[2].data[index]; // 中性数据

							const total = positiveValue + negativeValue + neutralValue; // 计算总和

							// 为每个日期生成一个饼图的数据
							return {
								name: date, // 每个时间点的名称为日期
								type: 'pie',
								radius: '50%', // 设置饼图的大小
								data: [
									{
										name: "正面",
										value: (positiveValue / total) * 100, // 正面占比
									},
									{
										name: "负面",
										value: (negativeValue / total) * 100, // 负面占比
									},
									{
										name: "中性",
										value: (neutralValue / total) * 100, // 中性占比
									}
								]
							};
						});

						// 设置 ECharts 图表选项
						this.modalChartInstance.setOption({
							baseOption: {
								title: { text: "2.5.1 情绪极性分布", left: "center" },
								timeline: {
									axisType: "category",
									autoPlay: true,
									playInterval: 5000,
									data: this.dates, // 时间轴数据
									label: { formatter: "{value}" },
								},
								tooltip: {
									trigger: 'item',
									formatter: "{b}: {c}%", // 鼠标悬停时显示百分比
								},
								series: [], // 饼图系列
							},
							options: pieSeries.map((series) => ({
								series: [series], // 每个时间点对应一个饼图
							})),
						});
					} else {
						// 正常情况
						// 其他图表配置，移除鼠标事件监听
						this.modalChartInstance.off("mouseover");
						this.modalChartInstance.off("mouseout");
						let series = null;
						let legendData = [];
						if (chartData.series.type === "line") {
							series = {
								type: chartData.series.type,
								data: chartData.series.data,
								label: {
									show: true,
									position: "top"
								}
							}
							legendData = [chartData.name]; // 单条图例为当前图表名称
						} else {
							// 多系列图表
							series = chartData.series.map(seriesItem => {
								legendData.push(seriesItem.name); // 收集系列名称作为图例数据
								return {
									...seriesItem,
									label: {
										show: true, // 显示标签
										position: "top", // 标签位置在顶部
									},
								};
							});
						}
						this.modalChartInstance.setOption({
							title: { text: chartData.name, left: "center" },
							tooltip: {
								trigger: 'item',  // 改为 item，这样每次鼠标悬停在柱状图上时，显示该柱状图的数据

							},
							legend: {
								data: legendData,
								top: 30,
							},
							xAxis: {
								type: "category",
								data: chartData.xAxis
							},
							yAxis: { type: "value" },
							series: series,
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


		showProvinceTimeSeries(provinceName) {
			const provinceIndex = this.chinaMapData.data[0].findIndex((p) => p.name === provinceName);
			if (provinceIndex !== -1) {
				const provinceData = this.dates.map((date, i) => ({
					date,
					value: this.chinaMapData.data[i][provinceIndex].value,
				}));
				this.renderLineChart(provinceName, provinceData);
			}
		},

		hideProvinceTooltip() {
			const tooltipDom = document.getElementById("province-tooltip");
			if (tooltipDom) {
				tooltipDom.style.display = "none";
			}
		},
		showCountryTimeSeries(countryName) {
			const countryIndex = this.worldMapData.data[0].findIndex((p) => p.name === countryName);
			if (countryIndex !== -1) {
				const countryData = this.dates.map((date, i) => ({
					date,
					value: this.worldMapData.data[i][countryIndex].value,
				}));
				this.renderLineChart(countryName, countryData);
			}
		},

		hideCountryTooltip() {
			const tooltipDom = document.getElementById("province-tooltip");
			if (tooltipDom) {
				tooltipDom.style.display = "none";
			}
		},

		renderLineChart(provinceName, data) {
			let tooltipDom = document.getElementById("province-tooltip");
			if (!tooltipDom) {
				tooltipDom = document.createElement("div");
				tooltipDom.id = "province-tooltip";
				tooltipDom.style.position = "absolute";
				tooltipDom.style.zIndex = "2000";
				tooltipDom.style.background = "rgba(255, 255, 255, 0.7)";
				tooltipDom.style.border = "1px solid #ddd";
				tooltipDom.style.borderRadius = "5px";
				tooltipDom.style.padding = "10px";
				tooltipDom.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
				tooltipDom.style.width = "1000px";
				tooltipDom.style.height = "300px";
				document.body.appendChild(tooltipDom);
			}

			tooltipDom.style.display = "block";
			tooltipDom.style.left = `${event.pageX + 10}px`;
			tooltipDom.style.top = `${event.pageY + 10}px`;

			const lineChart = echarts.init(tooltipDom);
			lineChart.setOption({
				title: { text: `${provinceName}人数时序变化`, left: "center", textStyle: { fontSize: 14 } },
				tooltip: { trigger: "axis" },
				xAxis: {
					type: "category",
					data: data.map((d) => d.date),
					axisLabel: {
						rotate: 45, // X轴标签旋转45度
						formatter: (value) => value.replace(/-/g, "/"), // 格式化日期显示（可选）
					},
				},
				yAxis: { type: "value" },
				series: [
					{
						data: data.map((d) => d.value),
						type: "line",
						smooth: true,
						areaStyle: {},
						label: {
							show: true, // 显示具体数值
							position: "top", // 数值显示在点的上方
							formatter: "{c}", // 格式化为具体数值
						},
					},
				],
			});
		},
	},
};
</script>

<style scoped>
.chart-container {
	border: 1px solid #ddd;
	border-radius: 8px;
	padding: 10px;
	height: 25vh;
	/* 每个图表高度为视窗高度的 25% */
	width: 100%;
	/* 宽度占满父级容器 */
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
	height: 90vh;
}

.modal-chart-container {
	width: 100%;
	height: 100%;
}

#modal-chart {
	width: 100%;
	height: 100%;
}

.custom-alert {
	background: linear-gradient(90deg, #4caf50, #8bc34a);
	color: white;
	border-radius: 8px;
	box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.custom-alert strong {
	font-size: 1.2rem;
}

.custom-alert .btn-close {
	color: white;
}

.custom-alert .btn-close:hover {
	background-color: rgba(255, 255, 255, 0.2);
}

.notification {
	position: fixed;
	top: -50px;
	/* 初始位置在屏幕顶部外 */
	left: 50%;
	transform: translateX(-50%);
	padding: 10px 20px;
	background-color: #4caf50;
	/* 提示的背景颜色 */
	color: white;
	font-size: 1rem;
	border-radius: 5px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	animation: slideInOut 4s ease-in-out;
	/* 4秒的飞入飞出动画 */
	z-index: 1100;
	/* 设置高于模态框的 z-index */
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.notification .close-btn {
	background: transparent;
	border: none;
	color: white;
	font-size: 0.9rem;
	margin-left: 10px;
	cursor: pointer;
}

.notification .close-btn:hover {
	text-decoration: underline;
}

@keyframes slideInOut {
	0% {
		top: -50px;
		/* 起始位置在屏幕外 */
		opacity: 0;
	}

	10% {
		top: 20px;
		/* 飞入到屏幕内 */
		opacity: 1;
	}

	90% {
		top: 20px;
		/* 保持在屏幕内 */
		opacity: 1;
	}

	100% {
		top: -50px;
		/* 飞出到屏幕外 */
		opacity: 0;
	}
}
</style>
