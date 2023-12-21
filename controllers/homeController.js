const User = require('../models/User');
const Post = require('../models/Post');
const Testimonial = require('../models/Testimonial');
const Visitor = require('../models/Visitor');
const Message = require('../models/Message');
const Comment = require('../models/Comment');
const moment = require('moment'); // Make sure to install moment.js
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const Feedback = require('../models/Feedback');
const partnerMessage = require('../models/PartnerMessage');


module.exports.indexView = async (req, res, next) => {

    const { totalVisitors, visitorsPercentageChange } = await getVisitorsStates();
    const { totalMessages, messagesPercentageChange } = await getMessagesStates();
    const { visitorsCurrentUrl } = await getVisitorsCurrentUrl();
    const { visitorsReferrer, visitorsTotalCount } = await getVisitorsReferrer();


    // Render the home page and pass the visitor count and percentage change
    res.render('home', { 
        visitorsCurrentUrl: visitorsCurrentUrl,
        visitorsTotalCount: visitorsTotalCount,
        visitorsReferrer: visitorsReferrer,
        visitorCount: totalVisitors, 
        
        visitorsPercentageChange: visitorsPercentageChange.toFixed(2), 
        messageCount: totalMessages, 
        messagesPercentageChange: messagesPercentageChange.toFixed(2), 

        title: 'Dashboard'
    });

}

module.exports.usersView = async (req, res, next) => {
    const users = await User.find();
    if(!users)
    {
        res.json({ message: err.message });
    }

    res.render('users', {title: 'Users', users: users});
}

module.exports.postsView = async (req, res, next) => {
    const posts = await Post.find();
    if(!posts)
    {
        res.json({ message: err.message });
    }

    res.render('posts', {title: 'Posts', posts: posts});
}

module.exports.testimonialView = async (req, res, next) => {
    const testimonials = await Testimonial.find();
    if(!testimonials)
    {
        res.json({ message: err.message });
    }

    return res.render('testimonials', {title: 'Testimonials', testimonials: testimonials});
}

module.exports.visitorsView = async (req, res, next) => {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    if(!visitors)
    {
        res.json({ message: err.message });
    }

    return res.render('visitors', {title: 'Visitors', visitors: visitors});
}

// module.exports.visitorsView = async (req, res, next) => {
//     try {
//         // Use aggregation to group by "ipAddress" and count occurrences
//         const groupedVisitors = await Visitor.aggregate([
//             {
//                 $group: {
//                     _id: '$ipAddress',  // Field to group by (assuming 'ipAddress' is the field)
//                     count: { $sum: 1 },  // Count occurrences
//                     referrer: { $last: '$referrer' },
//                     lastVisit: { $last: '$lastVisit' },
//                     country: { $last: '$country' },
//                     // Add more fields as needed
//                 }
//             }
//         ]);

//         // Render the view with the grouped visitors
//         return res.render('visitors', {
//             title: 'Visitors',
//             groupedVisitors: groupedVisitors
//         });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

module.exports.messagesView = async (req, res, next) => {
    const messages = await Message.find().sort({ createdAt: -1 });
    if(!messages)
    {
        res.json({ message: err.message });
    }

    return res.render('messages', {title: 'Messages', messages: messages});
}

// Comments view (index)
module.exports.commentsView = async (req, res, next) => {
    const comments = await Comment.find().sort({ createdAt: -1 });
    if(!comments)
    {
        res.json({ message: err.message });
    }

    return res.render('comments', {title: 'Comments', comments: comments});
}

module.exports.rolesView = async (req, res, next) => {
    const roles = await Role.find().sort({ createdAt: -1 });
    if(!roles)
    {
        res.json({ message: err.message });
    }

    return res.render('roles', {title: 'Roles', roles: roles});
}

module.exports.permissionsView = async (req, res, next) => {
    const permissions = await Permission.find().sort({ createdAt: -1 });
    if(!permissions)
    {
        res.json({ message: err.message });
    }

    return res.render('permissions', {title: 'Permissions', allPermissions: permissions});
}

module.exports.feedbacksView = async (req, res, next) => {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    if(!feedbacks)
    {
        res.json({ message: err.message });
    }

    return res.render('feedbacks', {title: 'Feedbacks', feedbacks: feedbacks});
}

module.exports.partnerMessageView = async (req, res, next) => {
    const partnermessages = await partnerMessage.find().sort({ createdAt: -1 });

    if(!partnermessages)
    {
        res.json({ message: err.message });
    }

    return res.render('partnermessages', {title: 'Partner Messages', partnermessages: partnermessages});
}

module.exports.visitorChartData = async (req, res, next) => {
    let tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const visitorData = await Visitor.aggregate([
        {
            $match: {
                lastVisit: { $gte: tenDaysAgo }
            }
        },
        {
            $group: {
                _id: { day: { $dayOfMonth: "$lastVisit" }, month: { $month: "$lastVisit" }, year: { $year: "$lastVisit" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1,
                "_id.day": 1
            }
        }
    ]);

    let visitorCounts = {};
    visitorData.forEach(item => {
        let date = `${item._id.year}-${("0" + item._id.month).slice(-2)}-${("0" + item._id.day).slice(-2)}`;
        visitorCounts[date] = item.count;
    });

    let dates = [...Array(10)].map((_, i) => {
        let d = new Date();
        d.setDate(d.getDate() - i);
        let localDate = `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`;
        return localDate;
    }).reverse();

    let dayData = dates.map(date => visitorCounts[date] || 0);

    return res.json({ dates: dates, dayData: dayData });
}

async function getVisitorsStates() {
    const endOfLastMonth = moment().subtract(1, 'months').endOf('month');
    const startOfLastMonth = moment().subtract(1, 'months').startOf('month');

    const visitorsLastMonth = await Visitor.find({
        lastVisit: {
            $gte: startOfLastMonth.toDate(),
            $lte: endOfLastMonth.toDate()
        }
    }).count();

    const totalVisitors = await Visitor.find().count();

    let visitorsPercentageChange = 100;
    if (visitorsLastMonth !== 0) {
        visitorsPercentageChange = ((totalVisitors - visitorsLastMonth) / visitorsLastMonth) * 100;
    }

    return { totalVisitors, visitorsPercentageChange };
}

async function getMessagesStates() {
    const endOfLastMonth = moment().subtract(1, 'months').endOf('month');
    const startOfLastMonth = moment().subtract(1, 'months').startOf('month');

    const messagesLastMonth = await Message.find({
        createdAt: {
            $gte: startOfLastMonth.toDate(),
            $lte: endOfLastMonth.toDate()
        }
    }).count();

    const totalMessages = await Message.find().count();


    let messagesPercentageChange = 100;
    if (messagesLastMonth !== 0) {
        messagesPercentageChange = ((totalMessages - messagesLastMonth) / messagesLastMonth) * 100;
    }

    return { totalMessages, messagesPercentageChange };
}

async function getVisitorsCurrentUrl() {
    const visitorsCurrentUrl = await Visitor.aggregate([
        {
            $group: {
                _id: "$currentUrl",
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                count: -1
            }
        },
        {
            $limit: 10
        }
    ]);

    return { visitorsCurrentUrl };
}

async function getVisitorsReferrer() {
    const visitorsReferrer = await Visitor.aggregate([
        {
            $group: {
                _id: "$referrer",
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                count: -1
            }
        },
        {
            $limit: 10
        }
    ]);

    const visitorsTotalCount = visitorsReferrer.reduce((total, data) => total + data.count, 0);

    return { visitorsReferrer, visitorsTotalCount };
}


module.exports.visitorChartDataYear = async (req, res, next) => {
    let startOfYear = new Date(new Date().getFullYear(), 0, 1); // start of this year
    let now = new Date(); // now

    const visitorData = await Visitor.aggregate([
        {
            $match: {
                lastVisit: { $gte: startOfYear, $lte: now }
            }
        },
        {
            $group: {
                _id: { month: { $month: "$lastVisit" }, year: { $year: "$lastVisit" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1
            }
        }
    ]);

    let visitorCounts = {};
    visitorData.forEach(item => {
        let date = `${item._id.year}-${("0" + item._id.month).slice(-2)}`;
        visitorCounts[date] = item.count;
    });

    let months = [...Array(now.getMonth() + 1)].map((_, i) => {
        let m = new Date(now.getFullYear(), i + 1, 0);
        let localDate = `${m.getFullYear()}-${("0" + (m.getMonth() + 1)).slice(-2)}`;
        return localDate;
    });

    let monthData = months.map(month => visitorCounts[month] || 0);

    return res.json({ monthData: monthData });
}
