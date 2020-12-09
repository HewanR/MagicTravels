export class Vacation {
    public constructor(
        public vacationId: string,
        public image: any,
        public destination: string,
        public price: number,
        public description: string,
        public startDate: string,
        public endDate: string,
        public numOfFollowers?: number,
        public isFollowed?: boolean
    ) { }
}