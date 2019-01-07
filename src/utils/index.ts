export const sendAction = (ws, action) => {
    ws.send(JSON.stringify(action));
};

export const findById = (target: number) => (value: { id: number }) => value.id === target;
