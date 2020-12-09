import { Vacation } from "../models/vacation";

export default class VacationsUtils {
    
    public static getVacationIndex(compState: any, vacation : Vacation){
        let index = compState.vacations.map(function (vacationToFind : Vacation) {
            return vacationToFind.vacationId;
        }).indexOf(vacation.vacationId);
        return index;
    }
}