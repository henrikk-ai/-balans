import Foundation
import Capacitor

class BalansBridgeViewController: CAPBridgeViewController {

    override open func capacitorDidLoad() {
        super.capacitorDidLoad()

        // Apple Hälsa
        bridge?.registerPluginInstance(
            BalansHealthPlugin()
        )

        // Balans Premium – StoreKit 2
        if #available(iOS 15.0, *) {
            bridge?.registerPluginInstance(
                BalansPremiumPlugin()
            )
        }

        NSLog("BALANS: HealthKit och Premium registrerade")
    }
}
