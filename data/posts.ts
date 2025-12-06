import { Post } from '@/types';

const generateLorem = (topic: string) => `
这是关于${topic}的详细内容。天涯社区（Tianya Club）创办于1999年3月1日，是全球最具影响力的华人社区之一。

[楼主]：各位涯友大家好，今天要讲的是${topic}的故事。这件事说来话长，要从十年前说起...
(此处省略一万字精彩论述...)

[1楼]：前排占座！楼主快更！
[2楼]：马克一下，养肥了再看。
[3楼]：这种深度的帖子现在很少见了，支持楼主。

${topic}的核心在于它揭示了当时社会的某种现象。我们回顾历史，往往能发现惊人的相似之处。
...
(更多深度解析)
...
[楼主]：继续更新。关于大家提到的那个问题，其实并没有那么简单。我们需要从宏观经济的角度去分析...

(此处为${topic}的精华部分，包含了大量的数据分析和逻辑推演，是当年天涯神帖的典型风格，逻辑严密，文笔犀利。)
`;

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: '【煮酒论史】明朝那些事儿',
    author: '当年明月',
    date: '2006-03-10',
    category: '煮酒论史',
    views: 9872543,
    replies: 54321,
    tags: ['历史', '明朝', '经典'],
    summary: '一部关于明朝的宏大历史断代史，用幽默诙谐的语言讲述了明朝三百年的历史故事。',
    content: generateLorem('明朝历史')
  },
  {
    id: '2',
    title: '【鬼话】鬼吹灯（盗墓者的经历）',
    author: '天下霸唱',
    date: '2006-02-24',
    category: '莲蓬鬼话',
    views: 8765432,
    replies: 43210,
    tags: ['玄幻', '探险', '盗墓'],
    summary: '一段关于摸金校尉的传奇故事，开创了盗墓小说的流派，情节跌宕起伏，扣人心弦。',
    content: generateLorem('古墓探险')
  },
  {
    id: '3',
    title: '【房产】关于未来十年房地产市场的推演',
    author: 'KK大神',
    date: '2010-07-15',
    category: '房产观澜',
    views: 5432109,
    replies: 32109,
    tags: ['经济', '房产', '神预言'],
    summary: '被誉为天涯房产界最神的预测贴，详细分析了未来十年的房价走势和宏观调控逻辑。',
    content: generateLorem('房地产经济周期')
  },
  {
    id: '4',
    title: '【杂谈】我要回到1997年过去了',
    author: '时空旅行者',
    date: '2012-11-20',
    category: '天涯杂谈',
    views: 2345678,
    replies: 12345,
    tags: ['穿越', '科幻', '脑洞'],
    summary: '一个极具真实感的穿越记录贴，楼主声称自己来自未来，准确预言了多项重大事件。',
    content: generateLorem('时间旅行悖论')
  },
  {
    id: '5',
    title: '【职场】十年深圳，我的打工生涯',
    author: '深漂老兵',
    date: '2008-05-12',
    category: '职场天地',
    views: 1987654,
    replies: 9876,
    tags: ['励志', '深圳', '职场'],
    summary: '记录了一个普通人在深圳十年的奋斗史，从流水线工人到企业高管的蜕变之路。',
    content: generateLorem('职场生存法则')
  },
  {
    id: '6',
    title: '【情感】左耳',
    author: '饶雪漫',
    date: '2005-09-01',
    category: '情感天地',
    views: 3456789,
    replies: 23456,
    tags: ['青春', '疼痛', '爱情'],
    summary: '关于青春、爱情与成长的疼痛文学代表作，感动了无数80后90后。',
    content: generateLorem('青春期情感困惑')
  },
  {
    id: '7',
    title: '【国学】周易的奥秘：解读华夏文明的密码',
    author: '易学大师',
    date: '2009-04-05',
    category: '煮酒论史',
    views: 1230000,
    replies: 4500,
    tags: ['国学', '周易', '哲学'],
    summary: '深入浅出地讲解周易六十四卦，探讨天人合一的哲学思想。',
    content: generateLorem('周易哲学')
  },
  {
    id: '8',
    title: '【悬疑】十宗罪：中国十大恐怖凶杀案',
    author: '蜘蛛',
    date: '2010-01-18',
    category: '莲蓬鬼话',
    views: 6700000,
    replies: 38000,
    tags: ['刑侦', '悬疑', '人性'],
    summary: '根据真实案例改编，揭示人性深处的黑暗与罪恶，警示世人。',
    content: generateLorem('刑侦破案')
  }
];