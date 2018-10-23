import Api from '@/services/Api'

export default {
    retrieveMoodData() {
        return Api().get('moodData');
    }
}
