export function Notification() {
    const OneSignal = window.OneSignal || [];
    OneSignal.push(() => {
        window.OneSignal.init({
            appId: "7dc81726-659a-47c4-bfdb-ebca6fbdd879",
            allowLocalhostAsSecureOrigin: true,
        });
        window.OneSignal.getUserId((id) => {
            console.log(id);
        })
    });
}
