import React, { useEffect } from 'react'
import { createContext, FunctionComponent, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { PFTPSocketEventsMap } from '@pftp/common'

export interface SockerContextState {
	socket: Socket<PFTPSocketEventsMap> | null
}

const socketDefaultValue: SockerContextState = {
	socket: null,
}

export const SocketContext = createContext<SockerContextState>(socketDefaultValue)
export const SocketProvider: FunctionComponent = ({ children }) => {
	const [socket, setSocket] = useState<Socket<PFTPSocketEventsMap> | null>(socketDefaultValue.socket)

	useEffect(() => {
		setSocket(io(process.env.NEXT_PUBLIC_SOCKET_URL as string, { transports: ['websocket', 'polling'] }))
	}, [])

	return (
		<SocketContext.Provider
			value={{
				socket,
			}}
		>
			{children}
		</SocketContext.Provider>
	)
}
