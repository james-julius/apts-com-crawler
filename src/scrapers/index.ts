import { run as ApartmentsDotCom } from './apartments.com.js'

const stringLookup: { [key: string]: Function } = {
    'apartments.com': ApartmentsDotCom
}

export default stringLookup
