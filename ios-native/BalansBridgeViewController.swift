import Capacitor
import Foundation

class BalansBridgeViewController: CAPBridgeViewController {

    override open func capacitorDidLoad() {
        super.capacitorDidLoad()

        NSLog("BALANS: capacitorDidLoad körs")

        guard let bridge = bridge else {
            NSLog("BALANS ERROR: Capacitor bridge saknas")
            return
        }

        bridge.registerPluginInstance(BalansHealthPlugin())

        NSLog("BALANS: HealthKit-plugin registrerad")
    }
}
