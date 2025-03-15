"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.getAllEvents = exports.createEvent = void 0;
const prisma_1 = require("../../lib/prisma");
const createEvent = async (req, res) => {
    const { title, description, expiresAt, productIds, isActive } = req.body;
    try {
        const event = await prisma_1.prisma.event.create({
            data: {
                title,
                description,
                expiresAt: new Date(expiresAt),
                isActive,
                products: {
                    connect: productIds.map((id) => ({ id }))
                }
            }
        });
        const finalEvent = await prisma_1.prisma.event.findUnique({
            where: {
                id: event.id
            },
            include: {
                products: {
                    include: {
                        category: true,
                        variants: true,
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: "Event created successfully",
            event: finalEvent
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.createEvent = createEvent;
const getAllEvents = async (_, res) => {
    try {
        const events = await prisma_1.prisma.event.findMany({
            include: {
                products: {
                    include: {
                        category: true,
                        variants: true
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: "Events fetched successfully!",
            events: events
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.getAllEvents = getAllEvents;
const updateEvent = async (req, res) => {
    const { id, title, description, expiresAt, productIds, isActive } = req.body;
    try {
        await prisma_1.prisma.event.update({
            where: {
                id
            },
            data: {
                title,
                description,
                expiresAt: new Date(expiresAt),
                isActive,
                products: {
                    set: [...productIds.map((eventId) => ({ id: eventId }))]
                }
            }
        });
        const finalEvent = await prisma_1.prisma.event.findUnique({
            where: {
                id
            },
            include: {
                products: {
                    include: {
                        category: true,
                        variants: true,
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            event: finalEvent
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    const { id } = req.query;
    try {
        await prisma_1.prisma.event.update({
            where: {
                id: id
            },
            data: {
                products: {
                    set: []
                }
            }
        });
        const event = await prisma_1.prisma.event.delete({
            where: {
                id: id
            }
        });
        res.status(200).json({
            success: true,
            message: "Event deleted successfully",
            event
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.deleteEvent = deleteEvent;
