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
			selectedChart: {},
			modalChartInstance: null,
			users: ["Alice", "Bob", "Cindy", "Dawid"],  // 用于“最xxx用户相关”
			keywords: ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"], // 用于最热搜索关键词
			events: ["event1", "event2", "event3", "event4", "event5"],
			platform: ["抖音", "快手", "b站", "微博", "推特"],
			dates: [
				"2025-01-01",
				"2025-01-11",
				"2025-01-21",
				"2025-01-31",
				"2025-02-10",
				"2025-02-20",
				"2025-03-02",
				"2025-03-12",
				"2025-03-22",
				"2025-04-01",
				"2025-04-11",
				"2025-04-21",
				"2025-05-01"
			],
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
				this.initCharts();
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
		}, 30000);
	},
	methods: {
		async loadMapData() {
			// 加载中国地图
			const chinaGeoJson = await fetch(`geojson/china.json`).then(res => res.json());
			// 移除南海诸岛
			if (chinaGeoJson.features) {
				chinaGeoJson.features = chinaGeoJson.features.filter(
					feature => feature.properties.name !== "南海诸岛"
				);
			}
			echarts.registerMap("china", chinaGeoJson);

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

				if (index != 0) {
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
				} else if (index === 0) {
					// 小图显示第一天的数据
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
		updateAllChart() {
			console.log("数据已更新！");
			this.triggerNotification(); // 触发提示
			// 更新全部表格

			// 1.1 用户画像
			// 1.1.1 国内用户地域分布

			const provinces = [
				"北京", "天津", "上海", "重庆", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江",
				"江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东",
				"广西", "海南", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏",
				"新疆", "香港", "澳门", "台湾"
			];

			this.chinaMapData.data = this.dates.map(() => {
				return provinces.map(province => ({
					name: province,
					value: parseInt(Math.random() * 1000), // 模拟随机数据
				}));
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
				this.dates,
				this.make_randomIntegerByDates(countriesAndRegions, this.dates),
				"1.1.2 国际用户地域分布"
			)

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
				this.make_randomDecimalByDates(emotions_splits, this.dates, 0.0, 1.0, "bar", true),
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
									label: { show: true },
									roam: true, // 启用鼠标滚轮缩放和拖拽
									emphasis: {
										label: {
											show: true,
											textStyle: { color: "#000" },
										},
									},
									data: data,
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
										color: ["#e0f7fa", "#0288d1", "#01579b"],
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
						// 由于“1.1.1 国际用户地域分布的图例太大了，故舍弃掉其图例
						// 其他图表配置，移除鼠标事件监听
						this.modalChartInstance.off("mouseover");
						this.modalChartInstance.off("mouseout");
						this.modalChartInstance.setOption({
							title: { text: chartData.name, left: "center" },
							tooltip: {
								trigger: 'item',  // 改为 item，这样每次鼠标悬停在柱状图上时，显示该柱状图的数据

							},
							xAxis: {
								type: "category",
								data: chartData.xAxis
							},
							yAxis: { type: "value" },
							series: chartData.series.map((series) => ({
								...series,
								label: {
									show: true, // 显示标签
									position: "top", // 标签位置在柱子顶部
								},
							})),
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
					} else {
						// 正常情况
						// 其他图表配置，移除鼠标事件监听
						this.modalChartInstance.off("mouseover");
						this.modalChartInstance.off("mouseout");
						let series = null;
						if (chartData.series.type === "line") {
							series = {
								type: chartData.series.type,
								data: chartData.series.data,
								label: {
									show: true,
									position: "top"
								}
							}
						} else {
							series = chartData.series.map((series) => ({
								...series,
								label: {
									show: true, // 显示标签
									position: "top", // 标签位置在柱子顶部
								},
							}));
						}
						this.modalChartInstance.setOption({
							title: { text: chartData.name, left: "center" },
							tooltip: {
								trigger: 'item',  // 改为 item，这样每次鼠标悬停在柱状图上时，显示该柱状图的数据

							},
							legend: {
								data: this.dates,
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
				tooltipDom.style.width = "500px";
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
