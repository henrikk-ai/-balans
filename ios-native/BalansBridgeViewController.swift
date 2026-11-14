
import Foundation
import Capacitor

class BalansBridgeViewController: CAPBridgeViewController {

    override open func capacitorDidLoad() {
        super.capacitorDidLoad()

        bridge?.registerPluginInstance(BalansHealthPlugin())
        bridge?.registerPluginInstance(BalansPremiumPlugin())

        NSLog("BALANS: HealthKit-plugin registrerad")
    }
}
