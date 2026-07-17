import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationModal } from '@/components/ConfirmationModal';
import { EditDescriptionModal } from '@/components/EditDescriptionModal';
import { FinishWorkoutModal } from '@/components/FinishWorkoutModal';
import { Header } from '@/components/Header';
import { MissingExercisesModal } from '@/components/MissingExercisesModal';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAppRouteParams } from '@/hooks/useAppRouteParams';
import { FailureType, FailureTypeMessage } from '@/models/FailureType';
import { MuscleGroup, getMuscleGroupMessage } from '@/models/MuscleGroup';
import { SetLog } from '@/models/Set';
import { SetType, getSetTypeMessage } from '@/models/SetType';

import { styles } from './styles';
import { useWorkoutRunner } from './useWorkoutRunner';

const SET_TYPE_OPTIONS = [
  {
    type: SetType.WarmUpSet,
    label: 'Aquecimento',
    icon: '🔥',
    description:
      'Séries de aquecimento preparam o corpo para cargas maiores. Use cargas leves e foque na execução.',
  },
  {
    type: SetType.RampUpSet,
    label: 'Reconhecimento',
    icon: '🎯',
    description:
      'Séries para calibrar a carga e testar a execução antes das séries de trabalho.',
  },
  {
    type: SetType.WorkSet,
    label: 'Trabalho',
    icon: '💪',
    description:
      'Séries principais do treino, onde o objetivo é gerar progresso de carga ou repetições.',
  },
  {
    type: SetType.TopSet,
    label: 'Top Set',
    icon: '⭐',
    description: 'Série de maior intensidade do treino. Deve ser feita com o máximo de esforço.',
  },
] as const;

type PersonalRecord = {
  weight: number;
  reps: number;
  failureType?: FailureType;
  type?: SetType;
  date?: string;
} | null;

const formatWeight = (value: number) =>
  Number.isInteger(value) ? String(value) : String(value).replace('.', ',');

const formatEditableWeight = (value: number, currentValue: string) => {
  if (Number.isInteger(value)) return String(value);
  const separator = currentValue.includes('.') ? '.' : ',';
  return String(value).replace('.', separator);
};

const normalizeWeightInput = (value: string, previousValue: string) => {
  const sanitized = value.replace(/[^0-9,.]/g, '');
  const separators = sanitized.match(/[,.]/g) ?? [];
  return separators.length <= 1 ? sanitized : previousValue;
};

const getSetTypeOption = (type: SetType) =>
  SET_TYPE_OPTIONS.find(option => option.type === type) ?? SET_TYPE_OPTIONS[0];

interface EmptyWorkoutStateProps {
  onBack: () => void;
}

const EmptyWorkoutState = ({ onBack }: EmptyWorkoutStateProps) => (
  <View style={styles.emptyStateContainer}>
    <Text style={styles.emptyStateTitle}>Treino vazio</Text>
    <Text style={styles.emptyStateDescription}>
      Este treino não possui exercícios cadastrados. Adicione exercícios antes de iniciar.
    </Text>
    <Pressable style={styles.primaryButton} onPress={onBack}>
      <Text style={styles.primaryButtonText}>Voltar</Text>
    </Pressable>
  </View>
);

interface ExerciseTitleProps {
  name: string;
  muscleGroup: MuscleGroup;
}

const ExerciseTitle = ({ name, muscleGroup }: ExerciseTitleProps) => (
  <View style={styles.exerciseHeading}>
    <Text style={styles.exerciseTitle}>{name}</Text>
    <Text style={styles.exerciseSubtitle}>{getMuscleGroupMessage(muscleGroup)}</Text>
  </View>
);

interface DescriptionCardProps {
  description?: string;
  onEdit: () => void;
}

const DescriptionCard = ({ description, onEdit }: DescriptionCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleGroup}>
        <Text style={styles.cardIcon}>▤</Text>
        <Text style={styles.cardTitle}>Descrição do exercício</Text>
      </View>
      <Pressable
        accessibilityLabel="Editar descrição do exercício"
        hitSlop={10}
        onPress={onEdit}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>✎</Text>
      </Pressable>
    </View>
    <View style={styles.descriptionBox}>
      <Text style={[styles.descriptionText, !description && styles.placeholderText]}>
        {description || 'Nenhuma descrição cadastrada para este exercício.'}
      </Text>
    </View>
    <Text style={styles.cardHint}>Toque no ícone de lápis para editar a descrição.</Text>
  </View>
);

interface PRCardProps {
  personalRecord: PersonalRecord;
  compact?: boolean;
}

const PRCard = ({ personalRecord, compact = false }: PRCardProps) => (
  <View style={[styles.card, compact && styles.compactCard]}>
    <View style={[styles.cardHeader, compact && styles.compactCardHeader]}>
      <View style={styles.cardTitleGroup}>
        <Text style={styles.prIcon}>↗</Text>
        <Text style={styles.cardTitle}>Último PR</Text>
      </View>
      {personalRecord?.date ? <Text style={styles.dateBadge}>{personalRecord.date}</Text> : null}
    </View>
    {personalRecord ? (
      <>
        <Text style={[styles.prValue, compact && styles.prValueCompact]}>
          {formatWeight(personalRecord.weight)} kg · {personalRecord.reps} reps ·{' '}
          {personalRecord.failureType
            ? FailureTypeMessage[personalRecord.failureType]
            : 'Sem falha informada'}
        </Text>
        {personalRecord.type ? (
          <Text style={styles.prType}>{getSetTypeMessage(personalRecord.type)}</Text>
        ) : null}
      </>
    ) : (
      <Text style={styles.emptyCardText}>Sem histórico para este exercício.</Text>
    )}
  </View>
);

interface StarterScreenProps {
  description?: string;
  personalRecord: PersonalRecord;
  selectedSetType: SetType;
  onEditDescription: () => void;
  onSelectSetType: (type: SetType) => void;
  onStart: () => void;
  onSkip: () => void;
}

const StarterScreen = ({
  description,
  personalRecord,
  selectedSetType,
  onEditDescription,
  onSelectSetType,
  onStart,
  onSkip,
}: StarterScreenProps) => {
  const selectedOption = getSetTypeOption(selectedSetType);

  return (
    <>
      <DescriptionCard description={description} onEdit={onEditDescription} />
      <PRCard personalRecord={personalRecord} />

      <View style={styles.sectionHeader}>
        <View style={styles.cardTitleGroup}>
          <Text style={styles.sectionIcon}>◇</Text>
          <Text style={styles.sectionTitle}>Tipo de série</Text>
        </View>
        <Text style={styles.infoIcon}>ⓘ</Text>
      </View>

      <View style={styles.setTypeGrid}>
        {SET_TYPE_OPTIONS.map(option => {
          const selected = option.type === selectedSetType;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={option.type}
              onPress={() => onSelectSetType(option.type)}
              style={[styles.setTypeCard, selected && styles.selectedCard]}
            >
              <Text style={styles.setTypeIcon}>{option.icon}</Text>
              <Text style={[styles.setTypeLabel, selected && styles.selectedText]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>i</Text>
        <Text style={styles.infoBannerText}>{selectedOption.description}</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={onStart}>
        <Text style={styles.primaryButtonText}>Iniciar série</Text>
        <Text style={styles.primaryButtonArrow}>→</Text>
      </Pressable>
      <Pressable style={styles.linkButton} onPress={onSkip}>
        <Text style={styles.linkButtonText}>Pular exercício</Text>
      </Pressable>
    </>
  );
};

interface StepperInputProps {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  onDecrement: () => void;
  onIncrement: () => void;
  maxLength?: number;
}

const StepperInput = ({
  label,
  unit,
  value,
  onChange,
  onDecrement,
  onIncrement,
  maxLength,
}: StepperInputProps) => (
  <View style={styles.stepperSection}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.stepperRow}>
      <Pressable accessibilityLabel={`Diminuir ${label}`} style={styles.stepperButton} onPress={onDecrement}>
        <Text style={styles.stepperButtonText}>−</Text>
      </Pressable>
      <View style={styles.valueContainer}>
        <TextInput
          maxLength={maxLength}
          keyboardType="decimal-pad"
          onChangeText={onChange}
          selectTextOnFocus
          style={styles.valueInput}
          value={value}
        />
        <Text style={styles.valueUnit}>{unit}</Text>
      </View>
      <Pressable accessibilityLabel={`Aumentar ${label}`} style={styles.stepperButton} onPress={onIncrement}>
        <Text style={styles.stepperButtonText}>+</Text>
      </Pressable>
    </View>
  </View>
);

interface StandardFormProps {
  currentSetNumber: number;
  selectedSetType: SetType;
  weight: string;
  reps: string;
  failureType: FailureType;
  personalRecord: PersonalRecord;
  onChangeWeight: (weight: string) => void;
  onChangeReps: (reps: string) => void;
  onChangeFailureType: (type: FailureType) => void;
  onSave: () => void;
  onBack: () => void;
}

const StandardForm = ({
  currentSetNumber,
  selectedSetType,
  weight,
  reps,
  failureType,
  personalRecord,
  onChangeWeight,
  onChangeReps,
  onChangeFailureType,
  onSave,
  onBack,
}: StandardFormProps) => {
  const setTypeOption = getSetTypeOption(selectedSetType);
  const parsedWeight = Number.parseFloat(weight.replace(',', '.'));
  const parsedReps = Number.parseInt(reps, 10);
  const numericWeight = Number.isFinite(parsedWeight) ? parsedWeight : 0;
  const numericReps = Number.isFinite(parsedReps) ? parsedReps : 0;
  const canSave = Number.isFinite(parsedWeight) && Number.isFinite(parsedReps);
  const failureOptions = [
    { type: FailureType.ZERO_RESERVED, label: '0 reserva' },
    { type: FailureType.ONE_RESERVED, label: '1 reserva' },
    { type: FailureType.REMAINING_REPS, label: 'Sobrando' },
    { type: FailureType.FAILURE, label: 'Falha' },
  ];

  return (
    <>
      <View style={styles.badgesRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Série {currentSetNumber}</Text>
        </View>
        <View style={[styles.badge, styles.selectedBadge]}>
          <Text style={styles.selectedBadgeText}>
            {setTypeOption.icon} {setTypeOption.label}
          </Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <StepperInput
          label="Carga"
          unit="kg"
          value={weight}
          onChange={onChangeWeight}
          onDecrement={() =>
            onChangeWeight(formatEditableWeight(Math.max(0, numericWeight - 2.5), weight))
          }
          onIncrement={() => onChangeWeight(formatEditableWeight(numericWeight + 2.5, weight))}
        />
        <View style={styles.formDivider} />
        <StepperInput
          label="Repetições"
          unit="reps"
          value={reps}
          maxLength={3}
          onChange={onChangeReps}
          onDecrement={() => onChangeReps(String(Math.max(0, numericReps - 1)))}
          onIncrement={() => onChangeReps(String(numericReps + 1))}
        />
        <View style={styles.formDivider} />
        <Text style={styles.inputLabel}>Tipo de falha</Text>
        <View style={styles.failureGrid}>
          {failureOptions.map(option => {
            const selected = option.type === failureType;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={option.type}
                onPress={() => onChangeFailureType(option.type)}
                style={[styles.failureButton, selected && styles.selectedCard]}
              >
                <Text style={[styles.failureText, selected && styles.selectedText]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <PRCard personalRecord={personalRecord} compact />

      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>i</Text>
        <Text style={styles.infoBannerText}>
          Após concluir esta série, vamos perguntar qual será o tipo da próxima para calcular o descanso inteligente.
        </Text>
      </View>

      <Pressable
        disabled={!canSave}
        onPress={onSave}
        style={[styles.primaryButton, !canSave && styles.disabledButton]}
      >
        <Text style={styles.primaryButtonText}>Concluir série</Text>
        <Text style={styles.primaryButtonArrow}>→</Text>
      </Pressable>
      <Pressable style={styles.linkButton} onPress={onBack}>
        <Text style={styles.linkButtonText}>Voltar ao exercício</Text>
      </Pressable>
    </>
  );
};

interface DecisionModalProps {
  visible: boolean;
  loggedSets: SetLog[];
  onChoose: (action: 'set' | 'finish', setType?: SetType) => void;
  getNextSetType: (sets: SetLog[]) => SetType;
  onCancel: () => void;
}

const DecisionModal = ({
  visible,
  loggedSets,
  onChoose,
  getNextSetType,
  onCancel,
}: DecisionModalProps) => {
  const insets = useSafeAreaInsets();
  const suggestedType = getNextSetType(loggedSets);
  const visibleSuggestion = suggestedType === SetType.BackoffSet ? SetType.WorkSet : suggestedType;

  return (
    <Modal animationType="slide" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.sheetOverlay}>
        <Pressable accessibilityLabel="Fechar" onPress={onCancel} style={styles.sheetBackdrop} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Qual será a próxima série?</Text>
          <Text style={styles.sheetSubtitle}>
            Toque no tipo da próxima série para iniciar o descanso inteligente.
          </Text>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {SET_TYPE_OPTIONS.map(option => {
              const selected = option.type === visibleSuggestion;
              return (
                <Pressable
                  accessibilityHint="Inicia a contagem do descanso"
                  accessibilityRole="button"
                  key={option.type}
                  onPress={() => onChoose('set', option.type)}
                  style={styles.sheetOption}
                >
                  <Text style={styles.sheetOptionIcon}>{option.icon}</Text>
                  <View style={styles.sheetOptionContent}>
                    <View style={styles.sheetOptionTitleRow}>
                      <Text style={styles.sheetOptionTitle}>{option.label}</Text>
                      {selected ? (
                        <View style={styles.suggestedBadge}>
                          <Text style={styles.suggestedBadgeText}>Sugerido</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.sheetOptionDescription}>{option.description}</Text>
                  </View>
                  <Text style={styles.sheetActionArrow}>→</Text>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              style={[styles.sheetOption, styles.finishOption]}
              onPress={() => onChoose('finish')}
            >
              <Text style={styles.sheetOptionIcon}>✓</Text>
              <View style={styles.sheetOptionContent}>
                <Text style={styles.sheetOptionTitle}>Finalizar exercício</Text>
                <Text style={styles.sheetOptionDescription}>
                  Concluir este exercício e avançar para o próximo.
                </Text>
              </View>
              <Text style={styles.sheetActionArrow}>→</Text>
            </Pressable>
          </ScrollView>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export const WorkoutRunnerScreen = () => {
  const navigation = useAppNavigation();
  const { routineTemplateId, workout } = useAppRouteParams<'WorkoutRunner'>();
  const runner = useWorkoutRunner(routineTemplateId, workout);

  if (!runner.currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={workout.description || workout.dayOfWeek} showBackButton />
        <EmptyWorkoutState onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const currentExercise = runner.currentExercise;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable accessibilityLabel="Voltar" hitSlop={10} onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Text style={styles.headerBack}>‹</Text>
          </Pressable>
          <Text style={styles.headerProgress}>
            {runner.currentExerciseIndex + 1} / {runner.exercisesState.length}
          </Text>
          <Pressable accessibilityLabel="Finalizar treino" hitSlop={10} onPress={runner.onEndPressed} style={styles.headerButton}>
            <Text style={styles.headerMenu}>⋮</Text>
          </Pressable>
        </View>
        <View style={styles.progressTrack}>
          {runner.exercisesState.map((exercise, index) => (
            <View
              key={exercise.id}
              style={[
                styles.progressSegment,
                exercise.isCompleted && styles.progressSegmentCompleted,
                index === runner.currentExerciseIndex && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>

        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ExerciseTitle name={currentExercise.name} muscleGroup={currentExercise.muscleGroup} />

          {!runner.hasSelectedInitialSetType ? (
            <StarterScreen
              description={currentExercise.description}
              personalRecord={runner.personalRecord}
              selectedSetType={runner.selectedSetType}
              onEditDescription={runner.onEditDescriptionPressed}
              onSelectSetType={runner.setSelectedSetType}
              onStart={() => runner.selectInitialSetType(runner.selectedSetType)}
              onSkip={runner.onSkipExercisePressed}
            />
          ) : (
            <StandardForm
              currentSetNumber={runner.loggedSetsForCurrentExercise.length + 1}
              failureType={runner.failureType}
              personalRecord={runner.personalRecord}
              reps={runner.reps}
              selectedSetType={runner.selectedSetType}
              weight={runner.weight}
              onBack={() => runner.setHasSelectedInitialSetType(false)}
              onChangeFailureType={runner.setFailureType}
              onChangeReps={value => runner.setReps(value.replace(/\D/g, ''))}
              onChangeWeight={value =>
                runner.setWeight(normalizeWeightInput(value, runner.weight))
              }
              onSave={runner.onSaveSetPressed}
            />
          )}
        </ScrollView>

        <ConfirmationModal
          cancelText="Não"
          confirmText="Sim, sair"
          description="O progresso atual do treino não será salvo."
          onCancel={runner.onCancelExit}
          onConfirm={runner.onConfirmExit}
          title="Interromper treino?"
          visible={runner.isExitModalVisible}
        />
        <MissingExercisesModal
          missingExerciseNames={runner.missingExerciseNames}
          onCancel={() => runner.setIsMissingModalVisible(false)}
          onConfirm={runner.onConfirmMissingExercises}
          visible={runner.isMissingModalVisible}
        />
        <FinishWorkoutModal
          calories={runner.calories}
          duration={runner.duration}
          onFinish={runner.onFinishWorkout}
          setCalories={runner.setCalories}
          setDuration={runner.setDuration}
          visible={runner.isFinishModalVisible}
        />
        {runner.isResting ? (
          <View style={styles.timerOverlay}>
            <Text style={styles.timerTitle}>Descanso inteligente</Text>
            <Text style={styles.timerSeconds}>{runner.secondsLeft}</Text>
            <Text style={styles.timerLabel}>segundos</Text>
            <Pressable style={styles.skipTimerButton} onPress={runner.skipRest}>
              <Text style={styles.skipTimerText}>Pular descanso</Text>
            </Pressable>
          </View>
        ) : null}
        <EditDescriptionModal
          initialDescription={currentExercise.description || ''}
          onCancel={runner.onCancelEditDescription}
          onSave={runner.handleSaveDescription}
          visible={runner.isEditDescriptionModalVisible}
        />
        <DecisionModal
          getNextSetType={runner.getNextSetType}
          loggedSets={runner.loggedSetsForCurrentExercise}
          onCancel={() => runner.setIsChoosingNextAction(false)}
          onChoose={runner.onChooseNextAction}
          visible={runner.isChoosingNextAction}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
