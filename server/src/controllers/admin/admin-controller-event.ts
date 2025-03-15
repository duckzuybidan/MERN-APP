import { Request, Response } from "express"
import { prisma } from '../../lib/prisma'

const createEvent = async (req: Request, res: Response) => {
    const {title, description, expiresAt, productIds, isActive} = req.body
    try {
        const event = await prisma.event.create({
            data: {
                title,
                description,
                expiresAt: new Date(expiresAt),
                isActive,
                products: {
                    connect: productIds.map((id: string) => ({id}))
                }
            }
        })
        const finalEvent = await prisma.event.findUnique({
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
        })
        res.status(200).json({
            success: true,
            message: "Event created successfully",
            event: finalEvent
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
const getAllEvents = async (_: Request, res: Response) => {
    try {
        const events = await prisma.event.findMany({
            include: {
                products: {
                    include: {
                        category: true,
                        variants: true
                    }
                }
            }
        })
        res.status(200).json({
            success: true,
            message: "Events fetched successfully!",
            events: events
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
const updateEvent = async (req: Request, res: Response) => {
    const {id, title, description, expiresAt, productIds, isActive} = req.body
    try {
        await prisma.event.update({
            where: {
                id
            },
            data: {
                title,
                description,
                expiresAt: new Date(expiresAt),
                isActive,
                products: {
                    set: [...productIds.map((eventId: string) => ({ id: eventId }))]
                }
            }
        })
        const finalEvent = await prisma.event.findUnique({
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
        })
        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            event: finalEvent
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
const deleteEvent = async (req: Request, res: Response) => {
    const {id} = req.query
    try {
        await prisma.event.update({
            where: {
                id: id as string
            },
            data: {
                products: {
                    set: []
                }
            }
        })
        const event = await prisma.event.delete({
            where: {
                id: id as string
            }
        })
        res.status(200).json({
            success: true,
            message: "Event deleted successfully",
            event
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
export { 
    createEvent,
    getAllEvents,
    updateEvent,
    deleteEvent
}
