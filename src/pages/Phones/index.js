import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  MdAdd,
  MdCallReceived,
  MdCallMissed,
  MdClose,
  MdCheck,
} from 'react-icons/md';
import { KIND } from 'baseui/button';
import { Modal, ModalHeader, ModalBody, SIZE, ROLE } from 'baseui/modal';

import { HeaderContainer, Container } from '~/styles';
import { AddButton, ButtonGroup, ModalAction } from './styles';
import history from '~/services/history';
import PhoneList from '~/components/PhoneList';
import PhoneFilters from '~/components/PhoneFilters';
import {
  fetchPhoneListRequest,
  addCallPhoneRequest,
  CallStatus,
} from '~/store/ducks/phone';

function Phones() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({});
  const [askByPerson, setAskByPerson] = useState(false);
  const phones = useSelector((state) => state.phone.list);
  const [selectedFilter, setSelectedFilter] = useState(null);

  const phoneList = useMemo(() => {
    return phones.filter((p) => p.active && p.status === selectedFilter);
  }, [phones, selectedFilter]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPhoneListRequest());
  }, [dispatch]);

  function showPhoneOptions(phone) {
    setIsOpen(true);
    setSelected(phone);
  }

  function closePhoneOptions() {
    setIsOpen(false);
    setSelected({});
    setAskByPerson(false);
  }

  function handleSubmitCallStatus(callStatus) {
    dispatch(addCallPhoneRequest(selected, callStatus));

    if (callStatus === CallStatus.RECEIVED) {
      setAskByPerson(true);
    } else {
      closePhoneOptions();
    }
  }

  return (
    <>
      <HeaderContainer>
        <h1>Minha Sequência de Números</h1>
      </HeaderContainer>

      <Container>
        <PhoneFilters onSelect={(filter) => setSelectedFilter(filter)} />
        <AddButton
          kind={KIND.tertiary}
          onClick={() => history.push('/phones/create')}
        >
          <MdAdd /> <span>Adicionar números</span>
        </AddButton>

        <PhoneList phones={phoneList} onSelect={showPhoneOptions} />
      </Container>

      <Modal
        onClose={closePhoneOptions}
        closeable
        isOpen={isOpen}
        animate
        autoFocus
        size={SIZE.default}
        role={ROLE.dialog}
        unstable_ModalBackdropScroll="true"
      >
        <ModalHeader>
          {askByPerson
            ? 'Deseja adicionar um interessado?'
            : 'Atualizar número'}
        </ModalHeader>
        <ModalBody>
          <p>{selected.value}</p>

          {askByPerson ? (
            <>
              <ButtonGroup>
                <ModalAction
                  startEnhancer={() => <MdCheck size={20} />}
                  onClick={() =>
                    history.push(`/persons/create?phone=${selected.value}`)
                  }
                >
                  Sim
                </ModalAction>
                <ModalAction
                  kind={KIND.secondary}
                  startEnhancer={() => <MdClose size={20} />}
                  onClick={closePhoneOptions}
                >
                  Não
                </ModalAction>
              </ButtonGroup>
            </>
          ) : (
            <ButtonGroup>
              <ModalAction
                kind={KIND.secondary}
                startEnhancer={() => <MdCallReceived size={20} />}
                onClick={() => handleSubmitCallStatus(CallStatus.RECEIVED)}
              >
                Atendeu
              </ModalAction>
              <ModalAction
                kind={KIND.secondary}
                startEnhancer={() => <MdCallMissed size={20} />}
                onClick={() => handleSubmitCallStatus(CallStatus.MISSED)}
              >
                Não&nbsp;atendeu
              </ModalAction>
              <ModalAction
                kind={KIND.secondary}
                startEnhancer={() => <MdClose size={20} />}
                onClick={() => handleSubmitCallStatus(CallStatus.DONT_EXIST)}
              >
                Inexistente
              </ModalAction>
            </ButtonGroup>
          )}
        </ModalBody>
      </Modal>
    </>
  );
}

export default Phones;
