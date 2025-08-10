function initProposal() {
  const canvas = document.getElementById('signature-canvas');
  const signaturePad = new SignaturePad(canvas);
  const hiddenInput = document.getElementById('undertaking-signature-input');

  document.getElementById('clear-signature').addEventListener('click', () => {
    signaturePad.clear();
    hiddenInput.value = '';
  });

  function storeSignatureIfPresent() {
    if (!signaturePad.isEmpty()) {
      const dataURL = signaturePad.toDataURL('image/png');
      hiddenInput.value = dataURL;
    } else {
      hiddenInput.value = '';
    }
  }

  document.getElementById('save-proposal').addEventListener('click', () => {
    storeSignatureIfPresent();
    console.log("Saving proposal with signature:", hiddenInput.value.substring(0, 30) + '...');
  });

  document.getElementById('submit-proposal').addEventListener('click', () => {
    storeSignatureIfPresent();
  });

  // num_risks logic
  const numRisksInput = document.getElementById('num_risks');
  if (numRisksInput) {
    numRisksInput.value = '0';
    const riskMatrix = document.getElementById('consideration-risk-exposure');
    const updateNumRisks = () => {
      let numRisks = 0;
      const formGroups = riskMatrix.querySelectorAll('.form-group');
      formGroups.forEach(formGroup => {
        const radios = formGroup.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
          if (radio.checked && radio.value === 'yes') {
            const riskFactor = formGroup.getAttribute('data-risk-factor');
            numRisks += parseInt(riskFactor || '0');
          }
        });
      });
      numRisksInput.value = numRisks;
      const informedConsent = document.getElementById('informed-consent');
      if (informedConsent)
        informedConsent.style.display = numRisks > 0 ? 'block' : 'none';
    };

    updateNumRisks();

    const formGroups = riskMatrix.querySelectorAll('.form-group');
    formGroups.forEach(group => {
      group.addEventListener('change', updateNumRisks);
    });
  }
}

